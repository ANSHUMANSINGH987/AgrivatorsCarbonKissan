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
            import sys
            print(f"[GEE] Starting calculation for farmer {farmer_id}", file=sys.stderr, flush=True)
            print("[INFO] Fetching satellite data for the selected farm...")
            
            # 1. Define Area of Interest (AOI) - handle both MultiPolygon and Polygon formats
            coords = geojson_polygon.get('coordinates', [])
            
            # Validate coordinates
            if not coords:
                raise ValueError("No valid coordinates provided in geojson")
            
            print(f"[DEBUG] Raw coordinates structure type: {type(coords)}, len: {len(coords)}")
            
            # Handle nested polygon structure - extract the ring
            ring_coords = None
            
            # Recursively flatten to find actual coordinate pairs
            def find_ring(data, depth=0):
                """Recursively find the first valid coordinate ring"""
                if not isinstance(data, (list, tuple)) or len(data) == 0:
                    return None
                
                # Check if this level contains coordinate pairs [lon, lat]
                first_elem = data[0]
                
                # If first element is not a list/tuple, then data is already [lon, lat]
                if not isinstance(first_elem, (list, tuple)):
                    # This shouldn't happen in valid GeoJSON, but handle it
                    return None
                    
                # Check if first_elem is a coordinate pair [lon, lat]
                if len(first_elem) == 2 and isinstance(first_elem[0], (int, float)) and isinstance(first_elem[1], (int, float)):
                    # data is [coord_pair, coord_pair, ...] - we found the ring!
                    return data
                
                # Check if first_elem is a list of coordinate pairs
                if len(first_elem) > 0 and isinstance(first_elem[0], (list, tuple)):
                    first_of_first = first_elem[0]
                    if isinstance(first_of_first, (list, tuple)) and len(first_of_first) == 2:
                        if isinstance(first_of_first[0], (int, float)) and isinstance(first_of_first[1], (int, float)):
                            # first_elem is [[lon,lat], [lon,lat], ...] - dive into it
                            return find_ring(first_elem, depth + 1)
                
                # Try diving into first element
                return find_ring(first_elem, depth + 1)
            
            ring_coords = find_ring(coords)
            
            if ring_coords is None:
                raise ValueError("Could not parse polygon coordinates from nested structure")
            
            # Ensure we have at least 3 unique coordinate points
            if len(ring_coords) < 3:
                raise ValueError(f"Polygon must have at least 3 coordinates (received {len(ring_coords)})")
            
            # Auto-close if not already closed (Earth Engine requires closed rings)
            first_coord = ring_coords[0]
            last_coord = ring_coords[-1]
            
            # Convert to tuples for comparison (handles floating point variations)
            first_tuple = tuple(round(c, 6) for c in first_coord[:2])
            last_tuple = tuple(round(c, 6) for c in last_coord[:2])
            
            if first_tuple != last_tuple:
                ring_coords = list(ring_coords) + [first_coord]
            
            print(f"[DEBUG] Extracted polygon with {len(ring_coords)} coordinates")
            aoi = ee.Geometry.Polygon(ring_coords)

            # 2. Set Date Range (Last 12 months)
            end_date = datetime.date.today().strftime('%Y-%m-%d')
            start_date = (datetime.date.today() - datetime.timedelta(days=365)).strftime('%Y-%m-%d')
            print(f"[DEBUG] Date range: {start_date} to {end_date}")

            # 3. Fetch & Process Sentinel-2 Data
            dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                .filterBounds(aoi) \
                .filterDate(start_date, end_date) \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
                .map(self._mask_s2_clouds)

            image_count = dataset.size().getInfo()
            print(f"[DEBUG] Found {image_count} satellite images in the date range")
            
            if image_count == 0:
                raise ValueError("No satellite data available for this region in the selected period. Try another area or adjust the date range.")

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
            ndvi_result = ndvi_stats.getInfo()
            mean_ndvi = ndvi_result.get('NDVI') if isinstance(ndvi_result, dict) else None
            
            if mean_ndvi is None or mean_ndvi < -1 or mean_ndvi > 1:
                raise ValueError("No valid satellite data found for this region (likely too cloudy or invalid coordinates).")

            print(f"[DEBUG] NDVI Score: {mean_ndvi:.4f}")

            # Calculate area in hectares
            area_sq_meters = aoi.area().getInfo()
            area_hectares = area_sq_meters / 10000
            
            if area_hectares <= 0 or area_hectares > 50000:  # Sanity check: 1 ha to 50,000 ha
                raise ValueError(f"Invalid farm area detected: {area_hectares:.2f} hectares. Area should be between 1-50,000 hectares.")

            print(f"[DEBUG] Farm Area: {area_hectares:.2f} hectares")

            # 5. Extrapolate to Carbon Value
            carbon_data = self._extrapolate_carbon(mean_ndvi, area_hectares)

            # 6. Generate Certificate ID and prepare document
            cert_id = f"CERT-{farmer_id}-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            # Convert polygon to JSON string for Firestore compatibility
            import json
            polygon_json = json.dumps(geojson_polygon)
            
            mrvdata = {
                "certificate_id": cert_id,
                "farmer_id": farmer_id,
                "location_name": location_name or "Unknown Location",
                "farm_area_hectares": round(area_hectares, 2),
                "mean_ndvi_score": round(mean_ndvi, 4),
                "estimated_carbon_tonnes": carbon_data['tonnes'],
                "estimated_value_inr": carbon_data['value_inr'],
                "polygon_json": polygon_json,  # Store as JSON string instead of nested dict
                "timestamp": datetime.datetime.now().isoformat(),
                "period_start": start_date,
                "period_end": end_date
            }

            # 7. Save to Firebase (gracefully skip if Firebase not initialized)
            try:
                db = get_db()
                print(f"[DEBUG] Firebase DB initialized, saving certificate...")
                db.collection("certificates").document(cert_id).set(mrvdata)
                print(f"[OK] Certificate {cert_id} saved to Firebase.")
            except RuntimeError as re:
                print(f"[WARNING] Firebase not initialized: {re}")
            except Exception as e:
                print(f"[ERROR] Firebase save failed: {type(e).__name__}: {e}")
                import traceback
                traceback.print_exc()

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
            print(f"[ERROR] Validation Error: {str(ve)}")
            # Cloud obstruction or no data
            return {"error": str(ve), "error_type": "cloud_obstruction"}
        except Exception as e:
            print(f"[ERROR] Unexpected Error: {str(e)}")
            # Other errors
            return {"error": f"Failed to process satellite data: {str(e)}", "error_type": "server_error"}

    def _extrapolate_carbon(self, ndvi: float, area_hectares: float) -> dict:
        """Converts NDVI to Soil Organic Carbon (SOC) and INR."""
        if ndvi < 0.2: 
            # Bare soil or water, minimal carbon capture
            return {"tonnes": 0, "value_inr": 0} 

        # Realistic carbon estimation based on NDVI
        # Soil Organic Carbon = α * NDVI + β
        # Typical agricultural soils: 2-8 tonnes C/hectare
        alpha = 8.0      # Sensitivity to vegetation
        beta = 2.0       # Baseline carbon in soil
        
        # Tonnes per hectare
        tonnes_per_ha = (alpha * ndvi) + beta
        
        # Cap the maximum to prevent unrealistic values
        tonnes_per_ha = min(tonnes_per_ha, 12.0)  # Maximum 12 tonnes/ha
        
        total_tonnes = tonnes_per_ha * area_hectares
        
        # Assume 1 Carbon Credit (1 Tonne CO₂e) = ₹1,000 INR (more realistic)
        total_value = total_tonnes * 1000 
        
        print(f"[DEBUG] Carbon Calc: NDVI={ndvi:.4f}, Area={area_hectares:.2f}ha, " + 
              f"Tonnes/ha={tonnes_per_ha:.2f}, Total={total_tonnes:.2f}t, Value=₹{int(total_value)}")
        
        return {
            "tonnes": round(total_tonnes, 2),
            "value_inr": int(total_value)
        }