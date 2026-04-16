from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import os
import logging
import bcrypt
import jwt
import secrets
import shutil
from pathlib import Path

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# JWT Configuration
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

# Password hashing
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# JWT Token Management
def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

# Auth Helper
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: str
    name: str
    role: str = "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    grade: str
    description: str
    price: str
    originalPrice: Optional[str] = None
    image: str
    cookingTemp: Optional[str] = None
    badge: Optional[str] = None
    weight_unit: Optional[str] = "oz"
    availableForBBQ: Optional[bool] = False
    pricePerLb: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    grade: str
    description: str
    price: str
    originalPrice: Optional[str] = None
    image: str
    cookingTemp: Optional[str] = None
    badge: Optional[str] = None
    weight_unit: Optional[str] = "oz"
    availableForBBQ: Optional[bool] = False
    pricePerLb: Optional[float] = None  # oz or lbs

class Membership(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    price: str
    period: str
    features: List[str]
    highlight: bool = False
    bestValue: bool = False
    billing_type: Optional[str] = "monthly"
    yearly_price: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MembershipCreate(BaseModel):
    name: str
    price: str
    period: str
    features: List[str]
    highlight: bool = False
    bestValue: bool = False


class SteakBox(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    tagline: str
    description: str
    price: str
    features: List[str]
    icon: str = "🥩"
    highlight: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SteakBoxCreate(BaseModel):
    name: str
    tagline: str
    description: str
    price: str
    features: List[str]
    icon: str = "🥩"
    highlight: bool = False

class MenuItem(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    label: str
    link: str
    position: str = "header"  # header, hero, footer
    order: int = 0
    enabled: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MenuItemCreate(BaseModel):
    label: str
    link: str
    position: str = "header"
    order: int = 0
    enabled: bool = True


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

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    session_id: str
    amount: float
    currency: str
    status: str
    payment_status: str
    metadata: dict
    user_email: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DiscountCode(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    code: str
    description: str
    type: str  # "percentage" or "fixed"
    value: float  # percentage (0-100) or fixed amount
    min_purchase: float = 0.0
    max_uses: Optional[int] = None
    used_count: int = 0
    expires_at: Optional[datetime] = None
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DiscountCodeCreate(BaseModel):
    code: str
    description: str
    type: str
    value: float
    min_purchase: float = 0.0
    max_uses: Optional[int] = None
    expires_at: Optional[datetime] = None
    active: bool = True

class ValidateDiscountRequest(BaseModel):
    code: str
    cart_total: float

# Initialize Stripe
stripe_checkout = None

def get_stripe_checkout(request: Request):
    global stripe_checkout
    if stripe_checkout is None:
        api_key = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")
        host_url = str(request.base_url)
        webhook_url = f"{host_url}api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    return stripe_checkout

# Auth Routes
@api_router.post("/auth/login")
async def login(credentials: LoginRequest, response: Response):
    email = credentials.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=900,
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800,
        path="/"
    )
    
    return {
        "_id": user_id,
        "email": user["email"],
        "name": user["name"],
        "role": user["role"]
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

# Product Routes
@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find(
        {},
        {"_id": 1, "name": 1, "grade": 1, "description": 1, "price": 1, "originalPrice": 1, "image": 1, "cookingTemp": 1, "badge": 1, "weight_unit": 1, "availableForBBQ": 1, "pricePerLb": 1, "created_at": 1}
    ).limit(100).to_list(100)
    return [Product(**{**p, "_id": str(p["_id"])}) for p in products]

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, user: dict = Depends(get_current_user)):
    product_dict = product.dict()
    product_dict["created_at"] = datetime.now(timezone.utc)
    result = await db.products.insert_one(product_dict)
    product_dict["_id"] = str(result.inserted_id)
    return Product(**product_dict)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductCreate, user: dict = Depends(get_current_user)):
    await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": product.dict()}
    )
    updated = await db.products.find_one({"_id": ObjectId(product_id)})
    return Product(**{**updated, "_id": str(updated["_id"])})

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(get_current_user)):
    await db.products.delete_one({"_id": ObjectId(product_id)})
    return {"message": "Product deleted"}

# Membership Routes
@api_router.get("/memberships", response_model=List[Membership])
async def get_memberships():
    memberships = await db.memberships.find(
        {},
        {"_id": 1, "name": 1, "price": 1, "period": 1, "features": 1, "highlight": 1, "bestValue": 1, "created_at": 1}
    ).limit(50).to_list(50)
    return [Membership(**{**m, "_id": str(m["_id"])}) for m in memberships]

@api_router.post("/memberships", response_model=Membership)
async def create_membership(membership: MembershipCreate, user: dict = Depends(get_current_user)):
    membership_dict = membership.dict()
    membership_dict["created_at"] = datetime.now(timezone.utc)
    result = await db.memberships.insert_one(membership_dict)
    membership_dict["_id"] = str(result.inserted_id)
    return Membership(**membership_dict)

@api_router.put("/memberships/{membership_id}", response_model=Membership)
async def update_membership(membership_id: str, membership: MembershipCreate, user: dict = Depends(get_current_user)):
    await db.memberships.update_one(
        {"_id": ObjectId(membership_id)},
        {"$set": membership.dict()}
    )
    updated = await db.memberships.find_one({"_id": ObjectId(membership_id)})
    return Membership(**{**updated, "_id": str(updated["_id"])})

@api_router.delete("/memberships/{membership_id}")
async def delete_membership(membership_id: str, user: dict = Depends(get_current_user)):
    await db.memberships.delete_one({"_id": ObjectId(membership_id)})
    return {"message": "Membership deleted"}

# Discount Code Routes
@api_router.get("/discount-codes", response_model=List[DiscountCode])
async def get_discount_codes(user: dict = Depends(get_current_user)):
    codes = await db.discount_codes.find(
        {},
        {"_id": 1, "code": 1, "description": 1, "type": 1, "value": 1, "min_purchase": 1, "max_uses": 1, "used_count": 1, "expires_at": 1, "active": 1, "created_at": 1}
    ).limit(100).to_list(100)
    return [DiscountCode(**{**c, "_id": str(c["_id"])}) for c in codes]

@api_router.post("/discount-codes", response_model=DiscountCode)
async def create_discount_code(code: DiscountCodeCreate, user: dict = Depends(get_current_user)):
    code_dict = code.model_dump()
    code_dict["created_at"] = datetime.now(timezone.utc)
    code_dict["used_count"] = 0
    
    # Check for duplicate code
    existing = await db.discount_codes.find_one({"code": code_dict["code"].upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Discount code already exists")
    
    code_dict["code"] = code_dict["code"].upper()
    result = await db.discount_codes.insert_one(code_dict)
    code_dict["_id"] = str(result.inserted_id)
    return DiscountCode(**code_dict)

# Steak Boxes Routes
@api_router.get("/steak-boxes", response_model=List[SteakBox])
async def get_steak_boxes():
    boxes = await db.steak_boxes.find({}, {"_id": 0}).limit(50).to_list(50)
    return boxes
    boxes = await db.steak_boxes.find({}, {"_id": 0}).limit(50).to_list(50)
    return boxes

@api_router.post("/steak-boxes", response_model=SteakBox, dependencies=[Depends(get_current_user)])
async def create_steak_box(box: SteakBoxCreate):
    box_dict = box.model_dump()
    box_dict["created_at"] = datetime.now(timezone.utc)
    result = await db.steak_boxes.insert_one(box_dict)
    created_box = await db.steak_boxes.find_one({"_id": result.inserted_id}, {"_id": 0})
    return created_box

@api_router.put("/steak-boxes/{box_id}", response_model=SteakBox, dependencies=[Depends(get_current_user)])
async def update_steak_box(box_id: str, box: SteakBoxCreate):
    box_dict = box.model_dump()
    await db.steak_boxes.update_one({"id": box_id}, {"$set": box_dict})
    updated_box = await db.steak_boxes.find_one({"id": box_id}, {"_id": 0})
    if not updated_box:
        raise HTTPException(status_code=404, detail="Box not found")
    return updated_box

@api_router.delete("/steak-boxes/{box_id}", dependencies=[Depends(get_current_user)])
async def delete_steak_box(box_id: str):
    result = await db.steak_boxes.delete_one({"id": box_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Box not found")
    return {"message": "Box deleted successfully"}

# Menu Items Routes
@api_router.get("/menu-items", response_model=List[MenuItem])
async def get_menu_items():
    items = await db.menu_items.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return items

@api_router.post("/menu-items", response_model=MenuItem, dependencies=[Depends(get_current_user)])
async def create_menu_item(item: MenuItemCreate):
    item_dict = item.model_dump()
    item_dict["id"] = str(uuid4())  # Add unique ID
    item_dict["created_at"] = datetime.now(timezone.utc)
    result = await db.menu_items.insert_one(item_dict)
    created = await db.menu_items.find_one({"id": item_dict["id"]}, {"_id": 0})
    return created

@api_router.put("/menu-items/{item_id}", response_model=MenuItem, dependencies=[Depends(get_current_user)])
async def update_menu_item(item_id: str, item: MenuItemCreate):
    item_dict = item.model_dump()
    await db.menu_items.update_one({"id": item_id}, {"$set": item_dict})
    updated = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return updated

@api_router.delete("/menu-items/{item_id}", dependencies=[Depends(get_current_user)])
async def delete_menu_item(item_id: str):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted successfully"}


@api_router.put("/discount-codes/{code_id}", response_model=DiscountCode)
async def update_discount_code(code_id: str, code: DiscountCodeCreate, user: dict = Depends(get_current_user)):
    code_dict = code.dict()
    code_dict["code"] = code_dict["code"].upper()
    
    await db.discount_codes.update_one(
        {"_id": ObjectId(code_id)},
        {"$set": code_dict}
    )
    updated = await db.discount_codes.find_one({"_id": ObjectId(code_id)})
    return DiscountCode(**{**updated, "_id": str(updated["_id"])})

@api_router.delete("/discount-codes/{code_id}")
async def delete_discount_code(code_id: str, user: dict = Depends(get_current_user)):
    await db.discount_codes.delete_one({"_id": ObjectId(code_id)})
    return {"message": "Discount code deleted"}

@api_router.post("/validate-discount")
async def validate_discount(request: ValidateDiscountRequest):
    code = await db.discount_codes.find_one({"code": request.code.upper()})
    
    if not code:
        raise HTTPException(status_code=404, detail="Invalid discount code")
    
    if not code.get("active", True):
        raise HTTPException(status_code=400, detail="This discount code is no longer active")
    
    # Check expiry - handle both naive and aware datetimes
    if code.get("expires_at"):
        expires_at = code["expires_at"]
        now = datetime.now(timezone.utc)
        # If expires_at is naive, make it aware (assume UTC)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if now > expires_at:
            raise HTTPException(status_code=400, detail="This discount code has expired")
    
    # Check max uses
    if code.get("max_uses") and code.get("used_count", 0) >= code["max_uses"]:
        raise HTTPException(status_code=400, detail="This discount code has reached its usage limit")
    
    # Check minimum purchase
    if request.cart_total < code.get("min_purchase", 0):
        raise HTTPException(
            status_code=400, 
            detail=f"Minimum purchase of ${code.get('min_purchase', 0):.2f} required"
        )
    
    # Calculate discount
    discount_amount = 0.0
    if code["type"] == "percentage":
        discount_amount = request.cart_total * (code["value"] / 100)
    else:  # fixed
        discount_amount = min(code["value"], request.cart_total)
    
    return {
        "valid": True,
        "code": code["code"],
        "type": code["type"],
        "value": code["value"],
        "discount_amount": round(discount_amount, 2),
        "description": code.get("description", "")
    }

# Image Upload Route
@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix
    unique_filename = f"{secrets.token_hex(16)}{file_ext}"
    file_path = Path(ROOT_DIR) / "uploads" / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    image_url = f"{frontend_url}/uploads/{unique_filename}"
    
    return {"url": image_url}

# Checkout Routes
@api_router.post("/checkout/session")
async def create_checkout_session(checkout_req: CheckoutRequest, request: Request):
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
        
        # Apply discount code if provided (mutually exclusive with Subscribe & Save)
        discount_amount = 0.0
        discount_info = None
        
        if checkout_req.discount_code:
            # Enforce mutual exclusivity
            if has_subscribe_and_save:
                raise HTTPException(
                    status_code=400, 
                    detail="Discount codes cannot be combined with Subscribe & Save items. Please remove Subscribe & Save items or use the discount code."
                )
            
            code = await db.discount_codes.find_one({"code": checkout_req.discount_code.upper()})
            
            if code and code.get("active", True):
                # Validate code - handle datetime comparison
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
                            # Calculate discount on base total (without Subscribe & Save discount)
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
        # Re-raise HTTPExceptions as-is (don't wrap in 500)
        raise
    except Exception as e:
        logger.error(f"Checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    try:
        stripe = get_stripe_checkout(request)
        
        # Get status from Stripe
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

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        stripe = get_stripe_checkout(request)
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        webhook_response = await stripe.handle_webhook(body, signature)
        
        # Update transaction based on webhook
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "payment_status": "paid",
                    "status": "completed",
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
        
        return {"status": "success"}
    
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# CORS
cors_origins = os.environ.get("CORS_ORIGINS", "*")
if cors_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Admin seeding and startup
@app.on_event("startup")
async def startup_event():
    # Create indexes
    await db.users.create_index("email", unique=True)
    
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@mastermeatbox.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "MMB@dmin2025!Secure")
    
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info(f"Admin password updated: {admin_email}")
    
    # Write credentials
    Path("/app/memory").mkdir(exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write(f"""# Test Credentials

## Admin
- Email: {admin_email}
- Password: {admin_password}
- Role: admin

## Endpoints
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- GET /api/products
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id
- GET /api/memberships
- POST /api/memberships
- PUT /api/memberships/:id
- DELETE /api/memberships/:id
""")

# ── CRM / CUSTOMER DATA ──────────────────────────────────────────────────
class CustomerSubmission(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    country: Optional[str] = "US"
    source: Optional[str] = "checkout"
    notes: Optional[str] = None

@api_router.post("/customers")
async def create_customer(customer: CustomerSubmission):
    """Store customer information"""
    customer_data = customer.dict()
    customer_data["created_at"] = datetime.now(timezone.utc).isoformat()
    customer_data["id"] = secrets.token_urlsafe(16)
    
    await db.customers.insert_one(customer_data)
    return {"success": True, "customer_id": customer_data["id"]}

@api_router.get("/customers")
async def get_customers(current_user: dict = Depends(get_current_user)):
    """Get all customers (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    customers = await db.customers.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return customers

@api_router.get("/customers/{customer_id}")
async def get_customer(customer_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific customer details"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: dict = Depends(get_current_user)):
    """Delete customer"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.customers.delete_one({"id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"success": True}

# ── SITE SETTINGS (CMS) ───────────────────────────────────────────────────
class SiteSettings(BaseModel):
    # Promo Banner
    promo_banner: Optional[str] = None
    
    # Trust Bar
    trust_items: Optional[List[dict]] = None  # [{icon, iconUrl, text}]
    
    # Hero Section
    hero_headline: Optional[str] = None
    hero_subheadline: Optional[str] = None
    hero_cta_primary: Optional[str] = None
    hero_cta_secondary: Optional[str] = None
    hero_note: Optional[str] = None
    hero_image: Optional[str] = None
    
    # Products Section
    products_eyebrow: Optional[str] = None
    products_title: Optional[str] = None
    products_subtitle: Optional[str] = None
    
    # Why Section
    why_eyebrow: Optional[str] = None
    why_title: Optional[str] = None
    why_body: Optional[str] = None
    why_check_icon: Optional[str] = None  # Default: ✓
    why_check_icon_url: Optional[str] = None  # Image URL alternative
    why_highlights: Optional[List[str]] = None
    
    # Membership Section
    membership_eyebrow: Optional[str] = None
    membership_title: Optional[str] = None
    membership_subtitle: Optional[str] = None
    
    # Delivery Section
    delivery_title: Optional[str] = None
    delivery_text: Optional[str] = None
    delivery_steps: Optional[List[dict]] = None  # [{icon, iconUrl, label}]
    
    # Testimonials Section
    testimonials_eyebrow: Optional[str] = None
    testimonials_title: Optional[str] = None
    testimonial_star_icon: Optional[str] = None  # Default: ★
    testimonial_star_icon_url: Optional[str] = None  # Image URL alternative
    testimonials: Optional[List[dict]] = None
    
    # BBQ Calculator Section
    bbq_eyebrow: Optional[str] = None
    bbq_title: Optional[str] = None
    bbq_subtitle: Optional[str] = None
    bbq_aging_title: Optional[str] = None
    bbq_check_icon: Optional[str] = None  # Default: ✔
    bbq_check_icon_url: Optional[str] = None  # Image URL alternative
    bbq_aging_highlights: Optional[List[str]] = None
    
    # Final CTA Section
    final_title: Optional[str] = None
    final_btn_text: Optional[str] = None
    final_subtext: Optional[str] = None
    
    # Footer
    footer_tagline: Optional[str] = None
    footer_email: Optional[str] = None
    footer_phone: Optional[str] = None

@api_router.get("/site-settings")
async def get_site_settings():
    """Get current site settings"""
    settings = await db.site_settings.find_one({}, {"_id": 0})
    if not settings:
        return {
            "promo_banner": "15% off orders $299+ | 10% off orders $199+ | 5% off orders $99+ with code PREMIUM",
            "trust_items": [
                {"icon": "🔒", "iconUrl": "", "text": "Secure Stripe Checkout"},
                {"icon": "🧊", "iconUrl": "", "text": "Temperature-Controlled Shipping"},
                {"icon": "⭐", "iconUrl": "", "text": "USDA Prime & Wagyu Quality"},
                {"icon": "🚚", "iconUrl": "", "text": "Free Shipping Over $150"}
            ],
            "hero_headline": "Premium cuts. <span>No shortcuts.</span>",
            "hero_subheadline": "Hand-selected USDA Prime and Wagyu steaks delivered to your door — vacuum-sealed, temperature-controlled, and always exceptional.",
            "hero_cta_primary": "Shop Now",
            "hero_cta_secondary": "View Plans",
            "hero_note": "Free shipping over $150 · Secure checkout via Stripe",
            "products_eyebrow": "Premium Selection",
            "products_title": "Our Top <span>Cuts</span>",
            "products_subtitle": "A curated selection of premium beef — from classic steakhouse favorites to rare specialties.",
            "why_eyebrow": "Why Choose Us",
            "why_title": "Quality you can <span style='color:var(--gold);font-style:italic;'>trust</span>",
            "why_body": "We focus on sourcing and delivering premium cuts without overcomplicating the process. No unnecessary options — just high-quality meat done right.",
            "why_check_icon": "✓",
            "why_check_icon_url": "",
            "why_highlights": [
                "USDA Prime & Wagyu quality",
                "Carefully hand-selected cuts",
                "Consistent, reliable sourcing",
                "Temperature-controlled delivery"
            ],
            "membership_eyebrow": "Membership Plans",
            "membership_title": "Membership that <span>works for you</span>",
            "membership_subtitle": "Save more, order more. Choose the plan that fits your lifestyle.",
            "delivery_title": "Delivered <span style='color:var(--gold);font-style:italic;'>fresh</span>",
            "delivery_text": "Every order handled with temperature-controlled logistics to keep your cuts fresh from facility to front door.",
            "delivery_steps": [
                {"icon": "📦", "iconUrl": "", "label": "Order"},
                {"icon": "🧊", "iconUrl": "", "label": "Packed"},
                {"icon": "🌡️", "iconUrl": "", "label": "Cold-chain"},
                {"icon": "🚚", "iconUrl": "", "label": "Delivered"}
            ],
            "testimonials_eyebrow": "Reviews",
            "testimonials_title": "Customers <span>trust the quality</span>",
            "testimonial_star_icon": "★",
            "testimonial_star_icon_url": "",
            "testimonials": [
                {"text": "Best quality I've found online. Consistent and reliable every single time.", "author": "Michael R.", "stars": 5},
                {"text": "Simple ordering, premium cuts. Exactly what I needed for my family dinners.", "author": "Sarah K.", "stars": 5},
                {"text": "The dry-aged ribeye is exceptional. Worth every penny and then some.", "author": "James L.", "stars": 5}
            ],
            "bbq_eyebrow": "Premium BBQ Planning",
            "bbq_title": "Build a Premium BBQ <span>Experience</span>",
            "bbq_subtitle": "Not just a meal — dry-aged beef, precision portions, delivered ready for your perfect BBQ. Tell us your group size and we'll build the perfect meat selection instantly.",
            "bbq_aging_title": "The Art of Dry Aging",
            "bbq_check_icon": "✔",
            "bbq_check_icon_url": "",
            "bbq_aging_highlights": [
                "Dry-Aged Beef Up to 45 Days",
                "Premium Chicken & Artisan Sausage",
                "Delivered Ready for Grill",
                "Trusted by BBQ Hosts & Private Chefs"
            ],
            "final_title": "Better cuts start here",
            "final_btn_text": "Shop MasterMeatBox",
            "final_subtext": "Premium cuts. Simple process. Secure checkout.",
            "footer_tagline": "Premium cuts. No shortcuts.",
            "footer_email": "hello@mastermeatbox.com",
            "footer_phone": "817-807-2489"
        }
    return settings

@api_router.put("/site-settings")
async def update_site_settings(settings: SiteSettings, current_user: dict = Depends(get_current_user)):
    """Update site settings (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    settings_data = {k: v for k, v in settings.dict().items() if v is not None}
    settings_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.site_settings.update_one(
        {},
        {"$set": settings_data},
        upsert=True
    )
    return {"success": True, "message": "Site settings updated"}


# ─────────────────────────────────────────────────────────────────────────────
# BBQ Calculator Pricing Configuration
# ─────────────────────────────────────────────────────────────────────────────

class BBQPricing(BaseModel):
    # Calculator Settings
    enabled: bool = True
    
    # Portions per person by category (in lbs)
    steakPerPerson: float = 0.7  # 11 oz
    chickenPerPerson: float = 0.5  # 8 oz
    sausagePerPerson: float = 0.4  # 6.4 oz
    
    # Aging Options
    aging: List[dict] = [
        {"label": "21 Days (Standard)", "days": 21, "upcharge": 0},
        {"label": "30 Days (Premium)", "days": 30, "upcharge": 25},
        {"label": "45 Days (Ultra Aged)", "days": 45, "upcharge": 60}
    ]
    
    # BBQ Products with categories and pricing
    bbqProducts: List[dict] = []
    
    class Config:
        extra = "allow"

@api_router.get("/pricing")
async def get_pricing():
    """Public endpoint - Returns pricing configuration for BBQ Calculator"""
    pricing = await db.bbq_pricing.find_one({}, {"_id": 0})
    if not pricing:
        # Return default pricing if none exists
        default_pricing = {
            "aging": [
                {"label": "21 Days (Standard)", "days": 21, "upcharge": 0},
                {"label": "30 Days (Premium)", "days": 30, "upcharge": 25},
                {"label": "45 Days (Ultra Aged)", "days": 45, "upcharge": 60}
            ],
            "steakPerPerson": 0.7,
            "chickenPerPerson": 0.5,
            "sausagePerPerson": 0.4,
            "bbqProducts": [],
            "enabled": True
        }
        await db.bbq_pricing.insert_one(default_pricing.copy())
        pricing = default_pricing
    
    # Return raw dict
    from fastapi.responses import JSONResponse
    return JSONResponse(content=dict(pricing))

@api_router.put("/pricing")
async def update_pricing(pricing: BBQPricing, current_user: dict = Depends(get_current_user)):
    """Admin only - Update BBQ Calculator pricing configuration"""
    pricing_data = pricing.dict()
    await db.bbq_pricing.update_one(
        {},
        {"$set": pricing_data},
        upsert=True
    )
    return {"success": True, "message": "BBQ pricing updated"}

@api_router.post("/bbq-checkout")
async def create_bbq_checkout(request: dict, req: Request):
    """Create Stripe checkout session for BBQ order"""
    try:
        total_price = request.get("totalPrice", 0)
        people = request.get("people", 0)
        mode = request.get("mode", "mixed")
        aging = request.get("aging", "21 Days (Standard)")
        
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        
        # Create Stripe checkout session using same format as working checkout
        checkout_request = CheckoutSessionRequest(
            amount=round(total_price, 2),
            currency="usd",
            success_url=f"{frontend_url}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/",
            metadata={
                "type": "bbq_order",
                "people": str(people),
                "mode": mode,
                "aging": aging
            }
        )
        
        stripe = get_stripe_checkout(req)
        session = await stripe.create_checkout_session(checkout_request)
        
        return {"url": session.url, "sessionId": session.session_id}
    except Exception as e:
        logger.error(f"BBQ checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Include router - MUST be after all routes are defined
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
