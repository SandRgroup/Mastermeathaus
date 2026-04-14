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

class Membership(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    price: str
    period: str
    features: List[str]
    highlight: bool = False
    bestValue: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MembershipCreate(BaseModel):
    name: str
    price: str
    period: str
    features: List[str]
    highlight: bool = False
    bestValue: bool = False

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
    products = await db.products.find().to_list(1000)
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
    memberships = await db.memberships.find().to_list(1000)
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
    codes = await db.discount_codes.find().to_list(1000)
    return [DiscountCode(**{**c, "_id": str(c["_id"])}) for c in codes]

@api_router.post("/discount-codes", response_model=DiscountCode)
async def create_discount_code(code: DiscountCodeCreate, user: dict = Depends(get_current_user)):
    # Check if code already exists
    existing = await db.discount_codes.find_one({"code": code.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Discount code already exists")
    
    code_dict = code.dict()
    code_dict["code"] = code_dict["code"].upper()
    code_dict["used_count"] = 0
    code_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await db.discount_codes.insert_one(code_dict)
    code_dict["_id"] = str(result.inserted_id)
    return DiscountCode(**code_dict)

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
    
    # Check expiry
    if code.get("expires_at") and datetime.now(timezone.utc) > code["expires_at"]:
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
        
        # Apply discount code if provided
        discount_amount = 0.0
        discount_info = None
        
        if checkout_req.discount_code:
            code = await db.discount_codes.find_one({"code": checkout_req.discount_code.upper()})
            
            if code and code.get("active", True):
                # Validate code
                if not code.get("expires_at") or datetime.now(timezone.utc) <= code["expires_at"]:
                    if not code.get("max_uses") or code.get("used_count", 0) < code["max_uses"]:
                        if total_amount >= code.get("min_purchase", 0):
                            # Calculate discount
                            if code["type"] == "percentage":
                                discount_amount = total_amount * (code["value"] / 100)
                            else:  # fixed
                                discount_amount = min(code["value"], total_amount)
                            
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

# Include router
app.include_router(api_router)

# CORS
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
