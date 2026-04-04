from pydantic import BaseModel, Field
from typing import List

class PinDropRequest(BaseModel):
    lat: float = Field(..., description="Latitude of the dropped pin", ge=-90, le=90)
    lon: float = Field(..., description="Longitude of the dropped pin", ge=-180, le=180)

class GPSWalkRequest(BaseModel):
    # Validates that it's a list of [lon, lat] pairs
    coords: List[List[float]] = Field(..., description="List of [lon, lat] coordinates", min_length=3)

class KhasraRequest(BaseModel):
    khasra_number: str = Field(..., description="Khasra/plot number (e.g., '123/45')")
    tehsil: str = Field(default="Sehore", description="Revenue circle/Tehsil name (e.g., 'Sehore')")
    district: str = Field(default="Sehore", description="District name (e.g., 'Sehore')")