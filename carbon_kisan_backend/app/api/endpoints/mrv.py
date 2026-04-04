from fastapi import APIRouter, HTTPException
from app.schemas.mrv import MRVRequest
from app.services.gee_engine import DigitalMRVEngine

router = APIRouter()
engine = DigitalMRVEngine()

@router.post("/analyze")
async def analyze_farm(request: MRVRequest):
    try:
        # Convert Pydantic model to dict for the engine
        geojson = {"type": "Polygon", "coordinates": request.polygon.coordinates}
        
        # Call the GEE engine with farmer_id and location_name for Firebase tracking
        result = engine.calculate_farm_metrics(request.farmer_id, geojson, request.location_name)
        
        if "error" in result:
            # Distinguish between cloud obstruction (400) and server errors (500)
            if result.get("error_type") == "cloud_obstruction":
                raise HTTPException(status_code=400, detail=result["error"])
            else:
                raise HTTPException(status_code=500, detail=result["error"])
        
        # Return the flattened, complete response
        return result
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")