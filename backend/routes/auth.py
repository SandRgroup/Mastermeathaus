"""Authentication routes"""
from fastapi import APIRouter, HTTPException, Response, Request, Depends
from models.user import LoginRequest, User
from utils.auth import verify_password, create_access_token, create_refresh_token, get_current_user
from database import db
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login")
async def login(credentials: LoginRequest, response: Response):
    """User login endpoint"""
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(user["id"], user["email"])
    refresh_token = create_refresh_token(user["id"])
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=900
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800
    )
    
    return {
        "message": "Login successful",
        "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]},
        "token": access_token
    }

@router.post("/logout")
async def logout(response: Response):
    """User logout endpoint"""
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return current_user
