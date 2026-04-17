from fastapi import APIRouter, HTTPException, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from uuid import uuid4
import os
import base64
from typing import List

from models.site_image import SiteImage, SiteImageCreate, SiteImageUpdate

router = APIRouter()

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "mastersmeatbox")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Image slots for the website
IMAGE_SLOTS = {
    # Landing Page
    "hero_background": "Landing Page - Hero Background",
    "brand_story_image": "Landing Page - Brand Story Image",
    "features_quality_image": "Landing Page - Features Quality Image",
    
    # Products
    "product_placeholder": "Products - Placeholder Image",
    
    # Membership
    "membership_hero": "Membership - Hero Background",
    
    # Contact
    "contact_hero": "Contact - Hero Background",
    
    # Logo
    "site_logo": "Site Logo (Header/Footer)",
    "site_logo_dark": "Site Logo Dark Version",
}

@router.get("/slots")
async def get_image_slots():
    """Get all available image slots"""
    return {"slots": IMAGE_SLOTS}

@router.get("/", response_model=List[SiteImage])
async def get_all_images():
    """Get all site images"""
    images = await db.site_images.find({}, {"_id": 0}).to_list(1000)
    return images

@router.get("/{slot}")
async def get_image_by_slot(slot: str):
    """Get image for a specific slot"""
    image = await db.site_images.find_one({"slot": slot}, {"_id": 0})
    if not image:
        raise HTTPException(status_code=404, detail=f"No image found for slot: {slot}")
    return image

@router.post("/", response_model=SiteImage)
async def create_or_update_image(image_data: SiteImageCreate):
    """Create or update an image for a slot"""
    
    # Check if image already exists for this slot
    existing = await db.site_images.find_one({"slot": image_data.slot})
    
    if existing:
        # Update existing
        await db.site_images.update_one(
            {"slot": image_data.slot},
            {"$set": {
                "url": image_data.url,
                "alt_text": image_data.alt_text,
                "title": image_data.title,
                "width": image_data.width,
                "height": image_data.height,
                "file_size": image_data.file_size,
                "uploaded_at": datetime.now().isoformat()
            }}
        )
        updated = await db.site_images.find_one({"slot": image_data.slot}, {"_id": 0})
        return updated
    else:
        # Create new
        new_image = {
            "id": str(uuid4()),
            "slot": image_data.slot,
            "url": image_data.url,
            "alt_text": image_data.alt_text,
            "title": image_data.title,
            "width": image_data.width,
            "height": image_data.height,
            "file_size": image_data.file_size,
            "uploaded_at": datetime.now().isoformat(),
            "uploaded_by": "admin"
        }
        await db.site_images.insert_one(new_image)
        return new_image

@router.post("/upload/{slot}")
async def upload_image(slot: str, file: UploadFile = File(...)):
    """Upload an image file and assign to a slot"""
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, WebP, and GIF allowed.")
    
    # Read file
    contents = await file.read()
    file_size = len(contents)
    
    # Convert to base64 data URL
    base64_data = base64.b64encode(contents).decode()
    data_url = f"data:{file.content_type};base64,{base64_data}"
    
    # Create/update image record
    image_data = SiteImageCreate(
        slot=slot,
        url=data_url,
        alt_text=file.filename,
        title=IMAGE_SLOTS.get(slot, slot),
        file_size=file_size
    )
    
    result = await create_or_update_image(image_data)
    return result

@router.put("/{slot}", response_model=SiteImage)
async def update_image(slot: str, update_data: SiteImageUpdate):
    """Update image metadata"""
    existing = await db.site_images.find_one({"slot": slot})
    if not existing:
        raise HTTPException(status_code=404, detail=f"No image found for slot: {slot}")
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if update_dict:
        await db.site_images.update_one(
            {"slot": slot},
            {"$set": update_dict}
        )
    
    updated = await db.site_images.find_one({"slot": slot}, {"_id": 0})
    return updated

@router.delete("/{slot}")
async def delete_image(slot: str):
    """Delete an image (revert to default)"""
    result = await db.site_images.delete_one({"slot": slot})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"No image found for slot: {slot}")
    return {"message": f"Image for slot '{slot}' deleted successfully"}
