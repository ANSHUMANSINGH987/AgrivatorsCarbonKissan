import ee
import datetime
from app.core.firebase import get_db

class DigitalMRVEngine:
    def __init__(self):
        # We assume ee.Initialize() is already handled in app/main.py on startup
        pass

    def _mask_s2_clouds(self, image):
        """Removes clouds from Sentinel-2 imagery for accurate NDVI."""
        qa = image.select('QA60')
        cloudBitMask = 1 << 10
        cirrusBitMask = 1 << 11
        mask = qa.bitwiseAnd(cloudBitMask).eq(0).And(qa.bitwiseAnd(cirrusBitMask).eq(0))
        return image.updateMask(mask).divide(10000)

    def calculate_farm_metrics(self, farmer_id: str, geojson_polygon: dict, location_name: str = None) -> dict:
        """
        Takes a farmer_id, location_name, and GeoJSON polygon, fetches 12 months of satellite data, 
        calculates Carbon metrics, saves to Firebase, and returns certificate data.
        """
        try:
            print("[INFO] Fetching satellite data for the selected farm...")
            
            # 1. Define Area of Interest (AOI) - handle both MultiPolygon and Polygon formats
            coords = geojson_polygon.get('coordinates', [])
            
            # Validate coordinates
            if not coords or not coords[0]:
                raise ValueError("No valid coordinates provided in geojson")
            
            # Handle nested polygon structure from Earth Engine
            # If it's a list of lists of lists, it's already in the right format
            # If it's part of a MultiPolygon, take the first polygon
            if isinstance(coords[0][0], (list, tuple)) and isinstance(coords[0][0][0], (int, float)):
                # Format: [[[lon, lat], [lon, lat], ...], ...]  - Single polygon
                polygon_coords = coords
            else:
                # Handle MultiPolygon or other nested structures
                polygon_coords = coords[0] if coords else []
            
            if not polygon_coords:
                raise ValueError("Invalid coordinate structure in geojson")
                
            aoi = ee.Geometry.Polygon(polygon_coords)

            # 2. Set Date Range (Last 12 months)
            end_date = datetime.date.today().strftime('%Y-%m-%d')
            start_date = (datetime.date.today() - datetime.timedelta(days=365)).strftime('%Y-%m-%d')

            # 3. Fetch & Process Sentinel-2 Data
            dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                .filterBounds(aoi) \
                .filterDate(start_date, end_date) \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
                .map(self._mask_s2_clouds)

            # Create a single composite image (median health over the year)
            composite = dataset.median().clip(aoi)

            # 4. Calculate NDVI (Normalized Difference Vegetation Index)
            ndvi = composite.normalizedDifference(['B8', 'B4']).rename('NDVI')

            print("[INFO] Calculating biomass and carbon potential...")
            ndvi_stats = ndvi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=aoi,
                scale=10, # 10-meter resolution
                maxPixels=1e9
            )
            
            # Extract the actual value
            mean_ndvi = ndvi_stats.getInfo().get('NDVI')
            
            if mean_ndvi is None:
                raise ValueError("No valid satellite data found for this region (likely too cloudy).")

            # Calculate area in hectares
            area_sq_meters = aoi.area().getInfo()
            area_hectares = area_sq_meters / 10000

            # 5. Extrapolate to Carbon Value
            carbon_data = self._extrapolate_carbon(mean_ndvi, area_hectares)

            # 6. Generate Certificate ID and prepare document
            cert_id = f"CERT-{farmer_id}-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            mrvdata = {
                "certificate_id": cert_id,
                "farmer_id": farmer_id,
                "location_name": location_name or "Unknown Location",
                "farm_area_hectares": round(area_hectares, 2),
                "mean_ndvi_score": round(mean_ndvi, 4),
                "estimated_carbon_tonnes": carbon_data['tonnes'],
                "estimated_value_inr": carbon_data['value_inr'],
                "polygon": geojson_polygon,
                "timestamp": datetime.datetime.now().isoformat(),
                "period_start": start_date,
                "period_end": end_date
            }

            # 7. Save to Firebase (gracefully skip if Firebase not initialized)
            try:
                db = get_db()
                db.collection("certificates").document(cert_id).set(mrvdata)
                print(f"[OK] Certificate {cert_id} saved to Firebase.")
            except Exception as e:
                print(f"[WARNING] Firebase save failed (proceeding without DB): {e}")

            # 8. Return flattened response
            return {
                "status": "success",
                "farm_area_hectares": round(area_hectares, 2),
                "mean_ndvi_score": round(mean_ndvi, 4),
                "estimated_carbon_tonnes": carbon_data['tonnes'],
                "estimated_value_inr": carbon_data['value_inr'],
                "certificate_id": cert_id
            }

        except ValueError as ve:
            # Cloud obstruction or no data
            return {"error": str(ve), "error_type": "cloud_obstruction"}
        except Exception as e:
            # Other errors
            return {"error": f"Failed to process satellite data: {str(e)}", "error_type": "server_error"}

    def _extrapolate_carbon(self, ndvi: float, area_hectares: float) -> dict:
        """Converts NDVI to Soil Organic Carbon (SOC) and INR."""
        if ndvi < 0.2: 
            # Bare soil or water, minimal carbon capture
            return {"tonnes": 0, "value_inr": 0} 

        # Hackathon Physics: Linear proxy (SOC = α * NDVI + β)
        alpha = 25.5
        beta = 10.0
        
        # Tonnes per hectare
        tonnes_per_ha = (alpha * ndvi) + beta
        total_tonnes = tonnes_per_ha * area_hectares
        
        # Assume 1 Carbon Credit (1 Tonne) = ₹1,200 INR
        total_value = total_tonnes * 1200 
        
        return {
            "tonnes": round(total_tonnes, 2),
            "value_inr": int(total_value)
        }