from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from models.bbq_builder_settings import BBQBuilderSettings
import os

router = APIRouter()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.get("/bbq-builder-settings", response_model=BBQBuilderSettings)
async def get_bbq_builder_settings():
    """
    Get BBQ Builder settings (public endpoint)
    """
    try:
        settings = await db.bbq_builder_settings.find_one({"id": "default"}, {"_id": 0})
        
        if not settings:
            # Return defaults
            return BBQBuilderSettings()
        
        return BBQBuilderSettings(**settings)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch settings: {str(e)}")

@router.put("/bbq-builder-settings", response_model=BBQBuilderSettings)
async def update_bbq_builder_settings(settings: BBQBuilderSettings):
    """
    Update BBQ Builder settings (admin endpoint)
    """
    try:
        settings_dict = settings.dict()
        settings_dict['id'] = 'default'
        
        await db.bbq_builder_settings.update_one(
            {"id": "default"},
            {"$set": settings_dict},
            upsert=True
        )
        
        return settings
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")