from pydantic import BaseModel, Field
from typing import Optional, Dict

class InsightsRequest(BaseModel):
    region: str = Field(..., description="The farmer's region, e.g., 'Sehore, Madhya Pradesh'")
    latitude: Optional[float] = Field(default=None, description="Latitude of farmer's location")
    longitude: Optional[float] = Field(default=None, description="Longitude of farmer's location")

class ChatRequest(BaseModel):
    message: str = Field(..., description="The question the farmer asked in Hindi/English")
    farm_context: Optional[Dict] = Field(
        default=None, 
        description="Optional: The NDVI and Carbon data of their farm to give the AI context"
    )