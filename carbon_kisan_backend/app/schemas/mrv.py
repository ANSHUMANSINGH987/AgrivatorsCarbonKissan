from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class PolygonCoordinates(BaseModel):
    coordinates: List[Any]  # Accept any coordinate structure, validate in service

class MRVRequest(BaseModel):
    farmer_id: str
    location_name: Optional[str] = None  # From map search or GPS location
    polygon: PolygonCoordinates

class MRVResponse(BaseModel):
    status: str
    farm_area_hectares: float
    mean_ndvi_score: float
    estimated_carbon_tonnes: float
    estimated_value_inr: int
    certificate_id: str