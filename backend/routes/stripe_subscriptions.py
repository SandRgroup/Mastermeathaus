"""
Stripe Subscriptions & Membership Management
Handles recurring memberships, upgrades, downgrades, and webhook events
"""
from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import stripe
import os
from database import db

router = APIRouter(prefix="/stripe", tags=["stripe-subscriptions"])

# Initialize Stripe
stripe.api_key = os.environ.get("STRIPE_API_KEY")
WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

# Your domain for success/cancel URLs
DOMAIN = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Membership tier pricing (monthly)
MEMBERSHIP_PRICES = {
    0: {"name": "Free", "price": 0, "stripe_price_id": None},
    1: {"name": "Select", "price": 4.99, "stripe_price_id": "price_1QsLvr8Bh5mbNofJVfb9KYP3"},
    2: {"name": "Prime", "price": 12.99, "stripe_price_id": "price_1QsLw18Bh5mbNofJuDIJGF4k"},
    3: {"name": "Premium", "price": 19.99, "stripe_price_id": "price_1QsLw58Bh5mbNofJ2rh4eKUY"}
}

class CheckoutSessionRequest(BaseModel):
    tier_level: int  # 1, 2, or 3

@router.post("/create-checkout-session")
async def create_checkout_session(
    checkout_request: CheckoutSessionRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Create Stripe Checkout Session for membership purchase
    Redirects to Stripe's hosted checkout page
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get customer from token
    from routes.customer_auth import get_current_customer
    customer = await get_current_customer(authorization)
    
    tier_level = checkout_request.tier_level
    if tier_level not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Invalid tier level")
    
    tier_info = MEMBERSHIP_PRICES[tier_level]
    
    try:
        # Get or create Stripe customer
        stripe_customer_id = customer.get("stripe_customer_id")
        
        if not stripe_customer_id:
            # Create new Stripe customer
            stripe_customer = stripe.Customer.create(
                email=customer["email"],
                name=f"{customer['first_name']} {customer['last_name']}",
                metadata={"customer_id": customer["id"]}
            )
            stripe_customer_id = stripe_customer.id
            
            # Save Stripe customer ID to database
            await db.customers.update_one(
                {"id": customer["id"]},
                {"$set": {"stripe_customer_id": stripe_customer_id}}
            )
        
        # Create Checkout Session
        checkout_session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            line_items=[{
                'price': tier_info["stripe_price_id"],
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{DOMAIN}/portal?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{DOMAIN}/portal/upgrade?canceled=true",
            metadata={
                "customer_id": customer["id"],
                "tier_level": tier_level
            },
            subscription_data={
                "metadata": {
                    "customer_id": customer["id"],
                    "tier_level": tier_level
                }
            }
        )
        
        return {
            "url": checkout_session.url,
            "session_id": checkout_session.id
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upgrade-subscription")
async def upgrade_subscription(
    upgrade_request: CheckoutSessionRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Upgrade or downgrade an existing subscription
    Proration is handled automatically by Stripe
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    from routes.customer_auth import get_current_customer
    customer = await get_current_customer(authorization)
    
    tier_level = upgrade_request.tier_level
    if tier_level not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Invalid tier level")
    
    stripe_subscription_id = customer.get("stripe_subscription_id")
    if not stripe_subscription_id:
        raise HTTPException(status_code=400, detail="No active subscription found")
    
    tier_info = MEMBERSHIP_PRICES[tier_level]
    
    try:
        # Get current subscription
        subscription = stripe.Subscription.retrieve(stripe_subscription_id)
        
        # Update subscription item to new price
        stripe.Subscription.modify(
            stripe_subscription_id,
            items=[{
                "id": subscription["items"]["data"][0].id,
                "price": tier_info["stripe_price_id"]
            }],
            proration_behavior="create_prorations",
            metadata={"tier_level": tier_level}
        )
        
        # Update database
        await db.customers.update_one(
            {"id": customer["id"]},
            {"$set": {
                "membership_tier": tier_level,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {
            "message": f"Subscription updated to {tier_info['name']} tier",
            "tier_level": tier_level
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/cancel-subscription")
async def cancel_subscription(authorization: Optional[str] = Header(None)):
    """Cancel customer's subscription (downgrade to Free)"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    from routes.customer_auth import get_current_customer
    customer = await get_current_customer(authorization)
    
    stripe_subscription_id = customer.get("stripe_subscription_id")
    if not stripe_subscription_id:
        raise HTTPException(status_code=400, detail="No active subscription found")
    
    try:
        # Cancel at period end (don't charge immediately)
        subscription = stripe.Subscription.modify(
            stripe_subscription_id,
            cancel_at_period_end=True
        )
        
        return {
            "message": "Subscription will be canceled at the end of the current billing period",
            "cancel_at": subscription.cancel_at
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events
    Events: checkout.session.completed, customer.subscription.updated, invoice.payment_succeeded, etc.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        if WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(
                payload, sig_header, WEBHOOK_SECRET
            )
        else:
            import json
            event = json.loads(payload.decode("utf-8"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle different event types
    if event['type'] == "checkout.session.completed":
        session = event['data']['object']
        customer_id = session['metadata'].get("customer_id")
        tier_level = int(session['metadata'].get("tier_level", 0))
        
        if customer_id and session.get('subscription'):
            # Update customer with subscription info
            await db.customers.update_one(
                {"id": customer_id},
                {"$set": {
                    "membership_tier": tier_level,
                    "stripe_subscription_id": session['subscription'],
                    "subscription_status": "active",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            print(f"✓ Checkout completed - Customer {customer_id} upgraded to tier {tier_level}")
    
    elif event['type'] == "customer.subscription.updated":
        subscription = event['data']['object']
        customer_id = subscription['metadata'].get("customer_id")
        tier_level = int(subscription['metadata'].get("tier_level", 0))
        
        if customer_id:
            await db.customers.update_one(
                {"id": customer_id},
                {"$set": {
                    "membership_tier": tier_level,
                    "subscription_status": subscription['status'],
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            print(f"✓ Customer {customer_id} subscription updated to tier {tier_level}")
    
    elif event['type'] == "invoice.payment_succeeded":
        invoice = event['data']['object']
        subscription_id = invoice.get('subscription')
        
        if subscription_id:
            # Find customer by subscription ID
            customer = await db.customers.find_one(
                {"stripe_subscription_id": subscription_id},
                {"_id": 0}
            )
            
            if customer:
                await db.customers.update_one(
                    {"id": customer["id"]},
                    {"$set": {
                        "last_payment_date": datetime.now(timezone.utc).isoformat(),
                        "subscription_status": "active"
                    }}
                )
                
                print(f"✓ Payment succeeded for customer {customer['id']}")
    
    elif event['type'] == "customer.subscription.deleted":
        subscription = event['data']['object']
        customer_id = subscription['metadata'].get("customer_id")
        
        if customer_id:
            # Downgrade to Free tier
            await db.customers.update_one(
                {"id": customer_id},
                {"$set": {
                    "membership_tier": 0,
                    "subscription_status": "canceled",
                    "stripe_subscription_id": None,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            print(f"✓ Customer {customer_id} subscription canceled")
    
    return {"status": "success"}

@router.get("/subscription-status")
async def get_subscription_status(authorization: Optional[str] = Header(None)):
    """Get customer's current subscription status from Stripe"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    from routes.customer_auth import get_current_customer
    customer = await get_current_customer(authorization)
    
    stripe_subscription_id = customer.get("stripe_subscription_id")
    if not stripe_subscription_id:
        return {
            "has_subscription": False,
            "tier_level": customer.get("membership_tier", 0)
        }
    
    try:
        subscription = stripe.Subscription.retrieve(stripe_subscription_id)
        
        return {
            "has_subscription": True,
            "status": subscription.status,
            "current_period_end": subscription.current_period_end,
            "cancel_at_period_end": subscription.cancel_at_period_end,
            "tier_level": customer.get("membership_tier", 0)
        }
        
    except stripe.error.StripeError as e:
        return {
            "has_subscription": False,
            "error": str(e)
        }
