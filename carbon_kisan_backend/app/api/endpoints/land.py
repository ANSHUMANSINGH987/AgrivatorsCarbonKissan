from fastapi import APIRouter, HTTPException
from app.schemas.land import PinDropRequest, GPSWalkRequest
from app.services.auto_mapper import AutoMapperService

router = APIRouter()
mapper_service = AutoMapperService()

@router.post("/auto-boundary", response_model=dict)
async def auto_detect_boundary(request: PinDropRequest):
    """React calls this when a farmer drops a single pin on the map."""
    try:
        geojson = mapper_service.generate_boundary(request.lat, request.lon)
        if not geojson:
            raise HTTPException(status_code=404, detail="Could not detect boundary at these coordinates.")
        return {"status": "success", "geojson": geojson}
    except Exception as e:
        # Log your original exception internally here, expose a generic to the client
        raise HTTPException(status_code=500, detail="Internal server error mapping boundary.")

@router.post("/walk-boundary", response_model=dict)
async def manual_walk_boundary(request: GPSWalkRequest):
    """React calls this when a farmer completes a GPS walk."""
    try:
        geojson = mapper_service.generate_from_walk(request.coords)
        return {"status": "success", "geojson": geojson}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))