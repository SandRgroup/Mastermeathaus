from pydantic import BaseModel
from typing import Optional, Literal

class BBQBuilderSettings(BaseModel):
    enabled: bool = True
    mode: Literal['both', 'checkout', 'quote'] = 'both'
    title: Optional[str] = 'Premium BBQ Builder'
    subtitle: Optional[str] = 'Build your perfect BBQ. Every cut, every grade.'
    
    class Config:
        from_attributes = True