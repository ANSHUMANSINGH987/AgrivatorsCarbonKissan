from fastapi import APIRouter, HTTPException
from app.schemas.land import PinDropRequest, GPSWalkRequest, KhasraRequest
from app.services.auto_mapper import AutoMapperService
from app.services.khasra_service import KhasraLookupService

router = APIRouter()
mapper_service = AutoMapperService()
khasra_service = KhasraLookupService()

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

@router.post("/khasra-lookup", response_model=dict)
async def lookup_khasra(request: KhasraRequest):
    """
    Lookup khasra (land plot) number and return its GeoJSON polygon.
    This enables farmers to identify their field by government land record number.
    
    Sample khasra numbers to try: 123/45, 456/78, 789/12, 234/56, 567/89
    All are in Sehore, Madhya Pradesh.
    
    In production, this would connect to state land record APIs like:
    - mABhuBhoomi (Madhya Pradesh)
    - BHUVAN (National)
    - State Revenue Department portals
    """
    try:
        result = khasra_service.lookup_khasra(
            request.khasra_number, 
            request.tehsil,
            request.district
        )
        
        if result['status'] == 'success':
            print(f"[OK] Khasra lookup successful: {request.khasra_number} -> {result['owner']}")
            return {
                "status": "success",
                "khasra_number": result['khasra_number'],
                "owner": result['owner'],
                "area_hectares": result['area_hectares'],
                "geojson": result['geojson'],
                "message": result['message']
            }
        elif result['status'] == 'not_found':
            print(f"[WARNING] Khasra not found: {request.khasra_number}")
            raise HTTPException(status_code=404, detail=result['message'])
        else:  # mismatch
            print(f"[WARNING] Khasra validation failed: {result['message']}")
            raise HTTPException(status_code=400, detail=result['message'])
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Khasra lookup failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error looking up Khasra: {str(e)}")

@router.get("/sample-khasras", response_model=dict)
async def get_sample_khasras():
    """Get list of sample Khasra numbers available for testing."""
    khasras = khasra_service.get_sample_khasras()
    return {
        "status": "success",
        "message": "Sample Khasra numbers available for testing",
        "khasras": khasras,
        "hint": "Use any of these numbers in the khasra-lookup endpoint"
    }