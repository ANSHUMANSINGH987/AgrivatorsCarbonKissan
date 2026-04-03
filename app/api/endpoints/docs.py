from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from app.services.pdf_service import DocumentService
# from app.core.firebase import get_db  # Uncomment when firebase is active

router = APIRouter()
doc_service = DocumentService()

@router.get("/certificate/{cert_id}", response_class=HTMLResponse)
async def get_certificate(cert_id: str):
    try:
        # In a real app, you fetch this data from Firebase using the cert_id
        # db = get_db()
        # doc = db.collection("certificates").document(cert_id).get()
        # if not doc.exists: raise HTTPException(status_code=404)
        # data = doc.to_dict()
        
        # MOCK DATA for now so your frontend team can test it
        mock_data = {
            "certificate_id": cert_id,
            "farmer_name": "Rajesh Kumar",
            "metrics": {
                "farm_area_hectares": 12.5,
                "estimated_carbon_tonnes": 310,
                "estimated_value_inr": 372000
            }
        }
        
        html_string = doc_service.generate_farmer_certificate_html(mock_data)
        return html_string
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))