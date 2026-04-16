"""Stripe checkout routes"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from database import db
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["stripe"])

# Stripe client
stripe_checkout = None

def get_stripe_checkout(request: Request):
    global stripe_checkout
    if stripe_checkout is None:
        api_key = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")
        host_url = str(request.base_url)
        webhook_url = f"{host_url}api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    return stripe_checkout

class CartItem(BaseModel):
    product_id: str
    product_name: str
    price: float
    quantity: int
    weight: str
    subscribe: bool

class CheckoutRequest(BaseModel):
    cart_items: List[CartItem]
    origin_url: str
    discount_code: Optional[str] = None

@router.post("/checkout/session")
async def create_checkout_session(checkout_req: CheckoutRequest, request: Request):
    """Create Stripe checkout session"""
    try:
        stripe = get_stripe_checkout(request)
        
        # Calculate total amount from cart
        total_amount = 0.0
        metadata = {"items": []}
        
        for item in checkout_req.cart_items:
            item_total = item.price * item.quantity
            if item.subscribe:
                item_total *= 0.9  # 10% discount
            total_amount += item_total
            metadata["items"].append({
                "product_id": item.product_id,
                "name": item.product_name,
                "quantity": item.quantity,
                "weight": item.weight,
                "subscribe": item.subscribe
            })
        
        # Check for Subscribe & Save items
        has_subscribe_and_save = any(item.subscribe for item in checkout_req.cart_items)
        
        # Apply discount code if provided
        discount_amount = 0.0
        discount_info = None
        
        if checkout_req.discount_code:
            if has_subscribe_and_save:
                raise HTTPException(
                    status_code=400, 
                    detail="Discount codes cannot be combined with Subscribe & Save items."
                )
            
            code = await db.discount_codes.find_one({"code": checkout_req.discount_code.upper()})
            
            if code and code.get("active", True):
                code_valid = True
                if code.get("expires_at"):
                    expires_at = code["expires_at"]
                    now = datetime.now(timezone.utc)
                    if expires_at.tzinfo is None:
                        expires_at = expires_at.replace(tzinfo=timezone.utc)
                    if now > expires_at:
                        code_valid = False
                
                if code_valid and (not code.get("max_uses") or code.get("used_count", 0) < code["max_uses"]):
                    if total_amount >= code.get("min_purchase", 0):
                        base_total = sum(item.price * item.quantity for item in checkout_req.cart_items)
                        
                        if code["type"] == "percentage":
                            discount_amount = base_total * (code["value"] / 100)
                        else:  # fixed
                            discount_amount = min(code["value"], base_total)
                        
                        discount_info = {
                            "code": code["code"],
                            "type": code["type"],
                            "value": code["value"],
                            "amount": discount_amount
                        }
                        
                        # Increment usage count
                        await db.discount_codes.update_one(
                            {"_id": code["_id"]},
                            {"$inc": {"used_count": 1}}
                        )
        
        # Apply discount to total
        final_amount = max(0, total_amount - discount_amount)
        
        if discount_info:
            metadata["discount"] = discount_info
        
        # Create success/cancel URLs
        success_url = f"{checkout_req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{checkout_req.origin_url}/checkout/cancel"
        
        # Create Stripe checkout session
        checkout_request = CheckoutSessionRequest(
            amount=round(final_amount, 2),
            currency="usd",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"cart": str(metadata)}
        )
        
        session: CheckoutSessionResponse = await stripe.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction = {
            "session_id": session.session_id,
            "amount": final_amount,
            "original_amount": total_amount,
            "discount_amount": discount_amount,
            "discount_code": checkout_req.discount_code.upper() if checkout_req.discount_code else None,
            "currency": "usd",
            "status": "pending",
            "payment_status": "initiated",
            "metadata": metadata,
            "created_at": datetime.now(timezone.utc)
        }
        await db.payment_transactions.insert_one(transaction)
        
        return {
            "url": session.url, 
            "session_id": session.session_id,
            "discount_applied": discount_amount > 0,
            "discount_amount": round(discount_amount, 2) if discount_amount > 0 else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    """Get checkout status"""
    try:
        stripe = get_stripe_checkout(request)
        status: CheckoutStatusResponse = await stripe.get_checkout_status(session_id)
        
        # Update transaction in database
        existing = await db.payment_transactions.find_one({"session_id": session_id})
        if existing and existing["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "status": status.status,
                    "payment_status": status.payment_status,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }
    
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        stripe = get_stripe_checkout(request)
        event = await stripe.verify_webhook(payload, sig_header)
        
        # Handle different event types
        if event.type == "checkout.session.completed":
            session = event.data.object
            session_id = session.id
            
            # Update transaction status
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "status": "complete",
                    "payment_status": "paid",
                    "stripe_event_id": event.id,
                    "completed_at": datetime.now(timezone.utc)
                }}
            )
            
            logger.info(f"Payment completed for session: {session_id}")
        
        return {"status": "success"}
    
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
