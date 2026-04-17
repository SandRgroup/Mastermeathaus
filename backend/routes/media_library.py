"""
Media Library - Centralized Image Management
Store, browse, and delete all uploaded images from one place
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from pathlib import Path
import os
import shutil
import secrets
from utils.auth import get_current_user
from database import db

router = APIRouter(prefix="/media", tags=["media-library"])

ROOT_DIR = Path(__file__).parent.parent
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

class MediaFile(BaseModel):
    id: str
    filename: str
    original_name: str
    url: str
    file_size: int
    mime_type: str
    uploaded_by: str
    uploaded_at: str
    used_in: Optional[List[str]] = []  # List of where this image is used

@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload image to media library"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_ext = Path(file.filename).suffix
        unique_filename = f"{secrets.token_hex(16)}{file_ext}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Generate URL
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        image_url = f"{frontend_url}/uploads/{unique_filename}"
        
        # Save to media library database
        media_entry = {
            "id": unique_filename,
            "filename": unique_filename,
            "original_name": file.filename,
            "url": image_url,
            "file_size": file_size,
            "mime_type": file.content_type,
            "uploaded_by": current_user.get("email", "unknown"),
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "used_in": []
        }
        
        await db.media_library.insert_one(media_entry)
        
        return {
            "url": image_url,
            "filename": unique_filename,
            "file_size": file_size,
            "media_id": unique_filename
        }
        
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/library")
async def get_media_library(
    current_user: dict = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """Get all media files in library"""
    try:
        media_files = await db.media_library.find(
            {},
            {"_id": 0}
        ).sort("uploaded_at", -1).skip(skip).limit(limit).to_list(limit)
        
        total = await db.media_library.count_documents({})
        
        return {
            "total": total,
            "files": media_files,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/library/{media_id}")
async def get_media_file(
    media_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific media file details"""
    media_file = await db.media_library.find_one({"id": media_id}, {"_id": 0})
    
    if not media_file:
        raise HTTPException(status_code=404, detail="Media file not found")
    
    return media_file

@router.delete("/library/{media_id}")
async def delete_media_file(
    media_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete media file from library and disk"""
    try:
        # Get media file info
        media_file = await db.media_library.find_one({"id": media_id}, {"_id": 0})
        
        if not media_file:
            raise HTTPException(status_code=404, detail="Media file not found")
        
        # Check if file is being used
        if media_file.get("used_in") and len(media_file["used_in"]) > 0:
            return {
                "warning": True,
                "message": f"File is used in {len(media_file['used_in'])} places",
                "used_in": media_file["used_in"],
                "action": "Force delete or update references first"
            }
        
        # Delete from disk
        file_path = UPLOAD_DIR / media_file["filename"]
        if file_path.exists():
            os.remove(file_path)
        
        # Delete from database
        await db.media_library.delete_one({"id": media_id})
        
        return {
            "message": "Media file deleted successfully",
            "filename": media_file["filename"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/library/{media_id}/force")
async def force_delete_media_file(
    media_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Force delete media file even if it's being used"""
    try:
        media_file = await db.media_library.find_one({"id": media_id}, {"_id": 0})
        
        if not media_file:
            raise HTTPException(status_code=404, detail="Media file not found")
        
        # Delete from disk
        file_path = UPLOAD_DIR / media_file["filename"]
        if file_path.exists():
            os.remove(file_path)
        
        # Delete from database
        await db.media_library.delete_one({"id": media_id})
        
        # TODO: Update all references to remove this image
        # (products, site_images, etc.)
        
        return {
            "message": "Media file force deleted",
            "filename": media_file["filename"],
            "warning": "References to this image may be broken"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/library/{media_id}/track-usage")
async def track_media_usage(
    media_id: str,
    usage_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Track where a media file is being used"""
    try:
        usage_location = usage_data.get("location")  # e.g., "product:123" or "site_image:hero"
        
        if not usage_location:
            raise HTTPException(status_code=400, detail="Usage location required")
        
        # Add to used_in array
        await db.media_library.update_one(
            {"id": media_id},
            {"$addToSet": {"used_in": usage_location}}
        )
        
        return {"message": "Usage tracked"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_media_stats(current_user: dict = Depends(get_current_user)):
    """Get media library statistics"""
    try:
        total_files = await db.media_library.count_documents({})
        
        # Get total storage used
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_size": {"$sum": "$file_size"}
                }
            }
        ]
        
        result = await db.media_library.aggregate(pipeline).to_list(1)
        total_size = result[0]["total_size"] if result else 0
        
        # Get unused files
        unused_files = await db.media_library.count_documents({
            "$or": [
                {"used_in": {"$exists": False}},
                {"used_in": {"$size": 0}}
            ]
        })
        
        return {
            "total_files": total_files,
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "unused_files": unused_files
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
