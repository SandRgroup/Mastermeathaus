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
    wagyuUpcharge: float = 0.0  # Additional $ per unit
    wagyuUpcharge_unit: str = "lb"  # Unit for wagyu upcharge
    grassFedUpcharge: float = 0.0  # Additional $ per unit
    grassFedUpcharge_unit: str = "lb"  # Unit for grass fed upcharge
    dryAgedUpcharge: float = 0.0  # Additional $ per unit
    dryAgedUpcharge_unit: str = "lb"  # Unit for dry aged upcharge
    
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
    weight: float = 1.0
    weight_unit: str = "lb"
    wagyuUpcharge: float = 0.0
    wagyuUpcharge_unit: str = "lb"
    grassFedUpcharge: float = 0.0
    grassFedUpcharge_unit: str = "lb"
    dryAgedUpcharge: float = 0.0
    dryAgedUpcharge_unit: str = "lb"
    ranchOrigin: str = "Texas, USA"
    genetics: str = "Premium genetics"
    grainFinished: str = "350+ Days"
    gradeLabel: str = "GOLD Grade"
    meatType: str = "beef"
    category: str = "steak"
    image_url: Optional[str] = None
    defaultGrade: Optional[str] = None

class BBQProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    basePrice: Optional[float] = None
    weight: Optional[float] = None
    weight_unit: Optional[str] = None
    wagyuUpcharge: Optional[float] = None
    wagyuUpcharge_unit: Optional[str] = None
    grassFedUpcharge: Optional[float] = None
    grassFedUpcharge_unit: Optional[str] = None
    dryAgedUpcharge: Optional[float] = None
    dryAgedUpcharge_unit: Optional[str] = None
    ranchOrigin: Optional[str] = None
    genetics: Optional[str] = None
    grainFinished: Optional[str] = None
    gradeLabel: Optional[str] = None
    meatType: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    defaultGrade: Optional[str] = None
