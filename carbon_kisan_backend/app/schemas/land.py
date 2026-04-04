from pydantic import BaseModel, Field
from typing import List

class PinDropRequest(BaseModel):
    lat: float = Field(..., description="Latitude of the dropped pin", ge=-90, le=90)
    lon: float = Field(..., description="Longitude of the dropped pin", ge=-180, le=180)

class GPSWalkRequest(BaseModel):
    # Validates that it's a list of [lon, lat] pairs
    coords: List[List[float]] = Field(..., description="List of [lon, lat] coordinates", min_length=3)