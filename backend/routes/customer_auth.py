from fastapi import APIRouter, HTTPException, Response, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import bcrypt
import jwt
import os
from database import db

router = APIRouter(prefix="/customer", tags=["customer"])

# JWT Configuration - Use environment variable or fallback
JWT_SECRET = os.environ.get("CUSTOMER_JWT_SECRET", os.environ.get("JWT_SECRET", "customer-secret-change-in-production"))
JWT_ALGORITHM = "HS256"
CUSTOMER_TOKEN_EXPIRE_DAYS = 30

class CustomerRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class CustomerLogin(BaseModel):
    email: EmailStr
    password: str

class CustomerProfile(BaseModel):
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    membership_tier: Optional[int] = 0
    created_at: str

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(customer_id: str, email: str) -> str:
    payload = {
        "customer_id": customer_id,
        "email": email,
        "type": "customer",
        "exp": datetime.now(timezone.utc) + timedelta(days=CUSTOMER_TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_customer(authorization: Optional[str] = Header(None)) -> dict:
    """Dependency to get current authenticated customer from Bearer token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization[7:]  # Remove "Bearer " prefix
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "customer":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        customer_id = payload.get("customer_id")
        if not customer_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        customer = await db.customers.find_one({"id": customer_id}, {"_id": 0, "password": 0})
        if not customer:
            raise HTTPException(status_code=401, detail="Customer not found")
        
        return customer
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register")
async def register(customer: CustomerRegister):
    """Register a new customer"""
    # Check if email already exists
    existing = await db.customers.find_one({"email": customer.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create customer
    customer_data = {
        "id": str(uuid4()),
        "email": customer.email,
        "password": hash_password(customer.password),
        "first_name": customer.first_name,
        "last_name": customer.last_name,
        "phone": None,
        "address": None,
        "city": None,
        "state": None,
        "zip_code": None,
        "membership_tier": 0,  # Free tier
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.customers.insert_one(customer_data)
    
    # Create token
    token = create_token(customer_data["id"], customer_data["email"])
    
    return {
        "message": "Registration successful",
        "token": token,
        "customer": {
            "id": customer_data["id"],
            "email": customer_data["email"],
            "first_name": customer_data["first_name"],
            "last_name": customer_data["last_name"],
            "membership_tier": customer_data["membership_tier"]
        }
    }

@router.post("/login")
async def login(credentials: CustomerLogin):
    """Customer login"""
    # Find customer
    customer = await db.customers.find_one({"email": credentials.email}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(credentials.password, customer["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create token
    token = create_token(customer["id"], customer["email"])
    
    return {
        "message": "Login successful",
        "token": token,
        "customer": {
            "id": customer["id"],
            "email": customer["email"],
            "first_name": customer["first_name"],
            "last_name": customer["last_name"],
            "membership_tier": customer.get("membership_tier", 0)
        }
    }

@router.get("/profile")
async def get_profile(current_customer: dict = Depends(get_current_customer)):
    """Get customer profile (requires authentication via Bearer token)"""
    # Get membership details
    membership = await db.memberships.find_one(
        {"tier_level": current_customer.get("membership_tier", 0)}, 
        {"_id": 0}
    )
    
    return {
        "customer": current_customer,
        "membership": membership
    }

@router.put("/profile")
async def update_profile(profile_data: dict, current_customer: dict = Depends(get_current_customer)):
    """Update customer profile (requires authentication via Bearer token)"""
    # Remove sensitive/immutable fields
    profile_data.pop("password", None)
    profile_data.pop("email", None)
    profile_data.pop("id", None)
    profile_data.pop("membership_tier", None)
    profile_data.pop("created_at", None)
    profile_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.customers.update_one(
        {"id": current_customer["id"]},
        {"$set": profile_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    updated_customer = await db.customers.find_one({"id": current_customer["id"]}, {"_id": 0, "password": 0})
    return {"message": "Profile updated successfully", "customer": updated_customer}

@router.post("/logout")
async def logout():
    """Logout customer (client should delete token)"""
    return {"message": "Logout successful"}
