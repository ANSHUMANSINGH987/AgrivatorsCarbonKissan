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

@router.get("/earnings/{farmer_id}")
async def get_farmer_earnings(farmer_id: str):
    """Calculate total earnings and carbon credits for a farmer from all certificates."""
    try:
        try:
            db = get_db()
            certs = db.collection("certificates").where("farmer_id", "==", farmer_id).stream()
            
            total_earnings_inr = 0
            total_carbon_tonnes = 0
            total_area_hectares = 0
            certificate_count = 0
            
            certificate_details = []
            
            for doc in certs:
                cert_data = doc.to_dict()
                value = cert_data.get("estimated_value_inr", 0)
                carbon = cert_data.get("estimated_carbon_tonnes", 0)
                area = cert_data.get("farm_area_hectares", 0)
                
                total_earnings_inr += value
                total_carbon_tonnes += carbon
                total_area_hectares += area
                certificate_count += 1
                
                certificate_details.append({
                    "certificate_id": cert_data.get("certificate_id"),
                    "location_name": cert_data.get("location_name"),
                    "earnings_inr": value,
                    "carbon_tonnes": carbon,
                    "area_hectares": area,
                    "timestamp": cert_data.get("timestamp")
                })
            
            return {
                "status": "success",
                "farmer_id": farmer_id,
                "total_earnings_inr": round(total_earnings_inr, 2),
                "total_carbon_tonnes": round(total_carbon_tonnes, 2),
                "total_area_hectares": round(total_area_hectares, 2),
                "certificate_count": certificate_count,
                "certificates": certificate_details,
                "message": f"Farmer has earned ₹{round(total_earnings_inr, 2)} from {certificate_count} verified farms"
            }
        except RuntimeError:
            # Firebase not available, return zeros
            return {
                "status": "success",
                "farmer_id": farmer_id,
                "total_earnings_inr": 0,
                "total_carbon_tonnes": 0,
                "total_area_hectares": 0,
                "certificate_count": 0,
                "certificates": [],
                "message": "No earnings data available"
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate earnings: {str(e)}")

@router.get("/all-certificates")
async def get_all_certificates():
    """Get all certificates for business dashboard - aggregated by farmer."""
    try:
        try:
            db = get_db()
            all_certs = db.collection("certificates").stream()
            
            # Aggregate by farmer
            farmers_data = {}
            total_carbon = 0
            total_area = 0
            total_value = 0
            region_stats = {}
            
            for doc in all_certs:
                cert_data = doc.to_dict()
                farmer_id = cert_data.get("farmer_id", "Unknown")
                farmer_name = cert_data.get("farmer_name", f"Farmer {farmer_id}")
                location_name = cert_data.get("location_name", "Unknown Region")
                carbon = cert_data.get("estimated_carbon_tonnes", 0)
                area = cert_data.get("farm_area_hectares", 0)
                value = cert_data.get("estimated_value_inr", 0)
                
                total_carbon += carbon
                total_area += area
                total_value += value
                
                # Aggregate by farmer
                if farmer_id not in farmers_data:
                    farmers_data[farmer_id] = {
                        "farmer_id": farmer_id,
                        "farmer_name": farmer_name,
                        "region": location_name,
                        "carbon": 0,
                        "area": 0,
                        "value": 0,
                        "certificates_count": 0,
                        "score": 85,  # Default score
                        "grade": "A",
                        "status": "Verified"
                    }
                
                farmers_data[farmer_id]["carbon"] += carbon
                farmers_data[farmer_id]["area"] += area
                farmers_data[farmer_id]["value"] += value
                farmers_data[farmer_id]["certificates_count"] += 1
                
                # Update score based on carbon sequestration
                farmers_data[farmer_id]["score"] = min(95, 70 + int((carbon / 10) * 5))
                if farmers_data[farmer_id]["score"] >= 90:
                    farmers_data[farmer_id]["grade"] = "A+"
                elif farmers_data[farmer_id]["score"] >= 80:
                    farmers_data[farmer_id]["grade"] = "A"
                else:
                    farmers_data[farmer_id]["grade"] = "B+"
                
                # Aggregate by region
                if location_name not in region_stats:
                    region_stats[location_name] = {
                        "region": location_name,
                        "carbon": 0,
                        "area": 0,
                        "farmers": 0
                    }
                
                region_stats[location_name]["carbon"] += carbon
                region_stats[location_name]["area"] += area
                region_stats[location_name]["farmers"] += 1
            
            farmers_list = list(farmers_data.values())
            regions_list = list(region_stats.values())
            
            return {
                "status": "success",
                "summary": {
                    "total_carbon_tonnes": round(total_carbon, 2),
                    "total_area_hectares": round(total_area, 2),
                    "total_value_inr": round(total_value, 2),
                    "total_farmers": len(farmers_list),
                    "total_regions": len(regions_list)
                },
                "farmers": farmers_list,
                "regions": regions_list,
                "message": f"Retrieved data for {len(farmers_list)} farmers"
            }
        except RuntimeError:
            # Firebase not available
            return {
                "status": "success",
                "summary": {
                    "total_carbon_tonnes": 0,
                    "total_area_hectares": 0,
                    "total_value_inr": 0,
                    "total_farmers": 0,
                    "total_regions": 0
                },
                "farmers": [],
                "regions": [],
                "message": "No data available"
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve all certificates: {str(e)}")