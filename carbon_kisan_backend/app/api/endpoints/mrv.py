from fastapi import APIRouter, HTTPException
from app.schemas.mrv import MRVRequest
from app.services.gee_engine import DigitalMRVEngine
from app.services.pdf_service import DocumentService

router = APIRouter()
engine = DigitalMRVEngine()
doc_service = DocumentService()

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
        
        # Auto-generate certificate PDF
        try:
            cert_id = result.get("certificate_id")
            farmer_id = request.farmer_id
            farmer_name = f"Farmer {farmer_id}"
            
            certificate_data = {
                "certificate_id": cert_id,
                "farmer_id": farmer_id,
                "farmer_name": farmer_name,
                "metrics": {
                    "farm_area_hectares": result.get("farm_area_hectares"),
                    "estimated_carbon_tonnes": result.get("estimated_carbon_tonnes"),
                    "estimated_value_inr": result.get("estimated_value_inr")
                }
            }
            
            # Generate PDF
            pdf_path = doc_service.generate_certificate_pdf(certificate_data)
            
            # Add certificate URLs to response
            result["certificate_url"] = f"/api/docs/certificate/{cert_id}"
            result["certificate_download_url"] = f"/api/docs/certificate/{cert_id}/download"
            result["certificate_pdf_url"] = f"/api/docs/certificate/{cert_id}/generate-pdf"
            
            print(f"[OK] Certificate generated for {cert_id} at {pdf_path}")
        except Exception as cert_error:
            print(f"[WARNING] Certificate generation failed (analysis still succeeded): {cert_error}")
            # Don't let certificate generation failure block MRV results
        
        # Return the complete response with certificate links
        return result
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")