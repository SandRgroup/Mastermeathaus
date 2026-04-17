from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict
from utils.auth import get_current_user
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'masters_meat_haus')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

class BBQSettings(BaseModel):
    event_type_portions: Dict[str, float]

class BBQSettingsResponse(BaseModel):
    event_type_portions: Dict[str, float]

# Default portions
DEFAULT_PORTIONS = {
    "luxury": 1.3,
    "family": 1.1,
    "party": 1.0,
    "casual": 1.2
}

@router.get("", response_model=BBQSettingsResponse)
async def get_bbq_settings():
    """Get BBQ event type portion settings (public endpoint)"""
    settings = await db.bbq_settings.find_one({"_id": "default"}, {"_id": 0})
    
    if not settings:
        # Return defaults if not configured yet
        return BBQSettingsResponse(event_type_portions=DEFAULT_PORTIONS)
    
    return BBQSettingsResponse(event_type_portions=settings.get("event_type_portions", DEFAULT_PORTIONS))

@router.put("", response_model=BBQSettingsResponse)
async def update_bbq_settings(
    settings: BBQSettings,
    current_user: dict = Depends(get_current_user)
):
    """Update BBQ event type portion settings (admin only)"""
    
    # Validate portions are positive numbers
    for event_type, portion in settings.event_type_portions.items():
        if portion <= 0:
            raise HTTPException(status_code=400, detail=f"Portion for {event_type} must be positive")
    
    # Upsert settings
    await db.bbq_settings.update_one(
        {"_id": "default"},
        {
            "$set": {
                "event_type_portions": settings.event_type_portions
            }
        },
        upsert=True
    )
    
    return BBQSettingsResponse(event_type_portions=settings.event_type_portions)
