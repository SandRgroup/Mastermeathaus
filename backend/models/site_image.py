from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SiteImage(BaseModel):
    id: str
    slot: str  # e.g., "hero_background", "brand_story", "feature_image_1"
    url: str
    alt_text: Optional[str] = None
    title: Optional[str] = None
    uploaded_at: str
    uploaded_by: Optional[str] = "admin"
    width: Optional[int] = None
    height: Optional[int] = None
    file_size: Optional[int] = None  # in bytes

class SiteImageCreate(BaseModel):
    slot: str
    url: str
    alt_text: Optional[str] = None
    title: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    file_size: Optional[int] = None

class SiteImageUpdate(BaseModel):
    url: Optional[str] = None
    alt_text: Optional[str] = None
    title: Optional[str] = None
