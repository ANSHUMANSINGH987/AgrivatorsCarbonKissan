import ee

class AutoMapperService:
    def __init__(self):
        # We assume ee.Initialize() is already handled in app/main.py on startup
        pass

    def generate_boundary(self, lat: float, lon: float) -> dict:
        """
        Takes a single lat/lon coordinate, uses GEE SNIC image segmentation,
        and returns the GeoJSON polygon of that specific farm field.
        """
        try:
            print(f"🤖 Running AI Segmentation on Pin: {lat}, {lon}")
            # 1. Define the drop pin and a small search radius (300 meters)
            point = ee.Geometry.Point([lon, lat])
            search_area = point.buffer(300) 

            # 2. Get a clear satellite image for that exact spot
            image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                .filterBounds(point) \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10)) \
                .first() \
                .select(['B8', 'B4', 'B3']) # NIR, Red, Green bands for agriculture

            # 3. Apply SNIC (Simple Non-Iterative Clustering) Algorithm
            snic = ee.Algorithms.Image.Segmentation.SNIC(
                image=image, 
                size=50,           # Average field size
                compactness=0.5,   # Shape rigidity
                connectivity=8, 
                neighborhoodSize=256
            )

            # 4. Convert the clustered image pixels into physical vector polygons
            vectors = snic.select('clusters').reduceToVectors(
                geometry=search_area,
                scale=10,
                geometryType='polygon',
                eightConnected=True
            )

            # 5. Find the specific polygon that the farmer's pin landed inside
            farm_polygon = vectors.filterBounds(point).first()

            # Return as a standard GeoJSON dictionary
            return farm_polygon.geometry().getInfo()

        except Exception as e:
            raise Exception(f"Failed to auto-generate boundary from satellite: {str(e)}")

    def generate_from_walk(self, coords: list) -> dict:
        """
        Takes a list of coordinates from a user walking their field boundary
        and formats it into a valid, closed GeoJSON Polygon.
        """
        try:
            # GeoJSON polygons must be closed (first and last coordinate must match)
            if coords[0] != coords[-1]:
                coords.append(coords[0])
                
            return {
                "type": "Polygon",
                "coordinates": [coords]
            }
        except Exception as e:
            raise Exception(f"Invalid coordinate data provided: {str(e)}")