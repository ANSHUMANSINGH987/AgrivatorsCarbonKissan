import ee
import datetime

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

    def calculate_farm_metrics(self, geojson_polygon: dict) -> dict:
        """
        Takes a GeoJSON polygon, fetches 12 months of satellite data, 
        and calculates Carbon metrics (NDVI, Tonnes, INR).
        """
        try:
            print("🛰️ Fetching satellite data for the selected farm...")
            
            # 1. Define Area of Interest (AOI)
            coords = geojson_polygon['coordinates']
            aoi = ee.Geometry.Polygon(coords)

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

            print("🧮 Calculating biomass and carbon potential...")
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

            return {
                "status": "success",
                "farm_area_hectares": round(area_hectares, 2),
                "mean_ndvi_score": round(mean_ndvi, 4),
                "estimated_carbon_tonnes": carbon_data['tonnes'],
                "estimated_value_inr": carbon_data['value_inr']
            }

        except Exception as e:
            return {"error": f"Failed to process satellite data. Error: {str(e)}"}

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