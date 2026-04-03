from fastapi import APIRouter, HTTPException
from app.schemas.mrv import MRVRequest
from app.services.gee_engine import DigitalMRVEngine

router = APIRouter()
engine = DigitalMRVEngine() # Your Earth Engine class

@router.post("/analyze")
async def analyze_farm(request: MRVRequest):
    try:
        # Convert Pydantic model back to dict for your engine
        geojson = {"type": "Polygon", "coordinates": request.polygon.coordinates}
        
        # Call the heavy lifting function
        result = engine.calculate_farm_metrics(geojson)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return {"status": "success", "data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))