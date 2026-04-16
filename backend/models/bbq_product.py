"""BBQ Product models for premium meat selection"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId

class BBQProduct(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    description: str
    basePrice: float  # Base price per lb
    weight: float = 1.0  # Weight value
    weight_unit: str = "lb"  # Unit: oz, lb, or kg
    wagyuUpcharge: float = 0.0  # Additional $ for American Wagyu
    grassFedUpcharge: float = 0.0  # Additional $ for Grass Fed
    dryAgedUpcharge: float = 0.0  # Additional $ for Dry Aged
    
    # Product Information (CMS Editable)
    ranchOrigin: str = "Texas, USA"
    genetics: str = "Premium genetics, raised the right way"
    grainFinished: str = "350+ Days"
    gradeLabel: str = "GOLD Grade"
    
    # Categorization
    meatType: str = "beef"  # beef or pork
    category: str = "steak"  # steak, ribs, other
    
    image_url: Optional[str] = None
    defaultGrade: str = "prime"  # prime, wagyu, grassfed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class BBQProductCreate(BaseModel):
    name: str
    description: str
    basePrice: float
    wagyuUpcharge: float = 0.0
    grassFedUpcharge: float = 0.0
    dryAgedUpcharge: float = 0.0
    ranchOrigin: str = "Texas, USA"
    genetics: str = "Premium genetics"
    grainFinished: str = "350+ Days"
    gradeLabel: str = "GOLD Grade"
    meatType: str = "beef"
    category: str = "steak"
    image_url: Optional[str] = None
    defaultGrade: str = "prime"

class BBQProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    basePrice: Optional[float] = None
    weight: Optional[float] = None
    wagyuUpcharge: Optional[float] = None
    grassFedUpcharge: Optional[float] = None
    dryAgedUpcharge: Optional[float] = None
    ranchOrigin: Optional[str] = None
    genetics: Optional[str] = None
    grainFinished: Optional[str] = None
    gradeLabel: Optional[str] = None
    meatType: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    defaultGrade: Optional[str] = None
