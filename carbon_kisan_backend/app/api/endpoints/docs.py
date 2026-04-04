from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from app.services.pdf_service import DocumentService
from app.core.firebase import get_db
from typing import List
import os

router = APIRouter()
doc_service = DocumentService()

@router.get("/certificate/{cert_id}", response_class=HTMLResponse)
async def get_certificate(cert_id: str):
    """View certificate as HTML."""
    try:
        # First, try to load the HTML/PDF file from disk directly
        try:
            file_path = doc_service.get_certificate_path(cert_id)
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
        except:
            pass  # File not found on disk, try Firebase below
        
        # Try to fetch certificate data from Firebase
        try:
            db = get_db()
            doc = db.collection("certificates").document(cert_id).get()
            if doc.exists:
                mrv_data = doc.to_dict()
                # Transform Firebase data to the format expected by the template
                certificate_data = {
                    "certificate_id": mrv_data.get("certificate_id", cert_id),
                    "farmer_name": mrv_data.get("farmer_name", f"Farmer {mrv_data.get('farmer_id', 'Unknown')}"),
                    "metrics": {
                        "farm_area_hectares": mrv_data.get("farm_area_hectares", 0),
                        "estimated_carbon_tonnes": mrv_data.get("estimated_carbon_tonnes", 0),
                        "estimated_value_inr": mrv_data.get("estimated_value_inr", 0)
                    }
                }
                html_string = doc_service.generate_farmer_certificate_html(certificate_data)
                return html_string
        except RuntimeError:
            pass  # Firebase not initialized
        
        # Fallback: Generate certificate with mock data
        print(f"⚠️ Certificate {cert_id} not found in Firebase. Using mock data.")
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

@router.post("/certificate/{cert_id}/generate-pdf")
async def generate_certificate_pdf(cert_id: str):
    """Generate and save certificate as PDF."""
    try:
        # Fetch from Firebase
        try:
            db = get_db()
            doc = db.collection("certificates").document(cert_id).get()
            if not doc.exists:
                raise HTTPException(status_code=404, detail=f"Certificate {cert_id} not found.")
            
            mrv_data = doc.to_dict()
            certificate_data = {
                "certificate_id": mrv_data.get("certificate_id", cert_id),
                "farmer_name": mrv_data.get("farmer_name", f"Farmer {mrv_data.get('farmer_id', 'Unknown')}"),
                "metrics": {
                    "farm_area_hectares": mrv_data.get("farm_area_hectares", 0),
                    "estimated_carbon_tonnes": mrv_data.get("estimated_carbon_tonnes", 0),
                    "estimated_value_inr": mrv_data.get("estimated_value_inr", 0)
                }
            }
        except RuntimeError:
            # Fallback
            certificate_data = {
                "certificate_id": cert_id,
                "farmer_name": "Farmer Demo",
                "metrics": {
                    "farm_area_hectares": 12.5,
                    "estimated_carbon_tonnes": 310,
                    "estimated_value_inr": 372000
                }
            }
        
        # Generate PDF
        pdf_path = doc_service.generate_certificate_pdf(certificate_data)
        return {"status": "success", "message": "PDF generated", "file_path": pdf_path, "cert_id": cert_id}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@router.get("/certificate/{cert_id}/download")
async def download_certificate(cert_id: str):
    """Download certificate PDF or HTML."""
    try:
        # Get the actual file path
        file_path = doc_service.get_certificate_path(cert_id)
        
        # Determine media type based on file extension
        if file_path.endswith('.pdf'):
            media_type = "application/pdf"
            filename = f"{cert_id}.pdf"
        else:
            media_type = "text/html"
            filename = f"{cert_id}.html"
        
        return FileResponse(
            path=file_path,
            media_type=media_type,
            filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Certificate not found or download failed: {str(e)}")

@router.get("/certificates/{farmer_id}")
async def list_farmer_certificates(farmer_id: str):
    """List all certificates for a specific farmer."""
    try:
        try:
            db = get_db()
            certs = db.collection("certificates").where("farmer_id", "==", farmer_id).stream()
            
            certificate_list = []
            for doc in certs:
                cert_data = doc.to_dict()
                certificate_list.append({
                    "certificate_id": cert_data.get("certificate_id"),
                    "farmer_id": cert_data.get("farmer_id"),
                    "farm_area_hectares": cert_data.get("farm_area_hectares"),
                    "estimated_carbon_tonnes": cert_data.get("estimated_carbon_tonnes"),
                    "estimated_value_inr": cert_data.get("estimated_value_inr"),
                    "timestamp": cert_data.get("timestamp"),
                    "location_name": cert_data.get("location_name")
                })
            
            return {
                "status": "success",
                "farmer_id": farmer_id,
                "certificates": certificate_list,
                "total": len(certificate_list)
            }
        except RuntimeError:
            # Firebase not available
            return {"status": "success", "farmer_id": farmer_id, "certificates": [], "total": 0}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list certificates: {str(e)}")