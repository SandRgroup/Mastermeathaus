from fastapi import APIRouter, HTTPException, Response, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from uuid import uuid4
import bcrypt
import jwt
from database import db

router = APIRouter(prefix="/customer", tags=["customer"])

# JWT Secret (in production, use environment variable)
JWT_SECRET = "your-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"

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
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

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
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
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
async def get_profile(token: str):
    """Get customer profile"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        customer_id = payload["customer_id"]
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0, "password": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get membership details
    membership = await db.memberships.find_one(
        {"tier_level": customer.get("membership_tier", 0)}, 
        {"_id": 0}
    )
    
    return {
        "customer": customer,
        "membership": membership
    }

@router.put("/profile")
async def update_profile(token: str, profile_data: dict):
    """Update customer profile"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        customer_id = payload["customer_id"]
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Remove sensitive fields
    profile_data.pop("password", None)
    profile_data.pop("email", None)
    profile_data.pop("id", None)
    profile_data["updated_at"] = datetime.now().isoformat()
    
    result = await db.customers.update_one(
        {"id": customer_id},
        {"$set": profile_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    updated_customer = await db.customers.find_one({"id": customer_id}, {"_id": 0, "password": 0})
    return {"message": "Profile updated successfully", "customer": updated_customer}

@router.post("/logout")
async def logout():
    """Logout customer (client should delete token)"""
    return {"message": "Logout successful"}
