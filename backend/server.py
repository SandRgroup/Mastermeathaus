from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import secrets

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
