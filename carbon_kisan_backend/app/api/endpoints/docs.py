from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from app.services.pdf_service import DocumentService
from app.core.firebase import get_db

router = APIRouter()
doc_service = DocumentService()

@router.get("/certificate/{cert_id}", response_class=HTMLResponse)
async def get_certificate(cert_id: str):
    try:
        # Try to fetch from Firebase first
        try:
            db = get_db()
            doc = db.collection("certificates").document(cert_id).get()
            if doc.exists:
                mrv_data = doc.to_dict()
                # Transform Firebase data to the format expected by the template
                certificate_data = {
                    "certificate_id": mrv_data.get("certificate_id", cert_id),
                    "farmer_name": f"Farmer {mrv_data.get('farmer_id', 'Unknown')}",  # Use farmer_id if name not available
                    "metrics": {
                        "farm_area_hectares": mrv_data.get("farm_area_hectares", 0),
                        "estimated_carbon_tonnes": mrv_data.get("estimated_carbon_tonnes", 0),
                        "estimated_value_inr": mrv_data.get("estimated_value_inr", 0)
                    }
                }
            else:
                raise HTTPException(status_code=404, detail=f"Certificate {cert_id} not found.")
        except RuntimeError:
            # Firebase not initialized; use mock data for development
            print(f"⚠️ Firebase not initialized. Using mock data for certificate {cert_id}")
            certificate_data = {
                "certificate_id": cert_id,
                "farmer_name": "Farmer Demo",
                "metrics": {
                    "farm_area_hectares": 12.5,
                    "estimated_carbon_tonnes": 310,
                    "estimated_value_inr": 372000
                }
            }
        
        html_string = doc_service.generate_farmer_certificate_html(certificate_data)
        return html_string
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate certificate: {str(e)}")