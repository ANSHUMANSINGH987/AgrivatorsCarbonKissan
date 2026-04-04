"""
Mock Khasra (Land Record) Lookup Service
Simulates government land records (Bhumikanattha/Khasra database)
In production, this would connect to state land record API (e.g., mABhuBhoomi in MP)
"""

class KhasraLookupService:
    """Mock land record database for Khasra number lookups."""
    
    def __init__(self):
        # Mock Khasra database with sample farm polygons in Sehore, Madhya Pradesh
        # Each entry: khasra_number -> GeoJSON polygon
        self.khasra_db = {
            # Format: "khasra/plot": {"owner": "name", "area": "hectares", "polygon": {...}}
            "123/45": {
                "owner": "Rajesh Kumar",
                "area": 2.5,
                "tehsil": "Sehore",
                "district": "Sehore",
                "state": "Madhya Pradesh",
                "geojson": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [77.5, 23.15],
                            [77.52, 23.15],
                            [77.52, 23.17],
                            [77.5, 23.17],
                            [77.5, 23.15]
                        ]
                    ]
                }
            },
            "456/78": {
                "owner": "Priya Singh",
                "area": 1.8,
                "tehsil": "Sehore",
                "district": "Sehore",
                "state": "Madhya Pradesh",
                "geojson": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [77.55, 23.18],
                            [77.57, 23.18],
                            [77.57, 23.20],
                            [77.55, 23.20],
                            [77.55, 23.18]
                        ]
                    ]
                }
            },
            "789/12": {
                "owner": "Mohan Patel",
                "area": 4.2,
                "tehsil": "Sehore",
                "district": "Sehore",
                "state": "Madhya Pradesh",
                "geojson": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [77.60, 23.12],
                            [77.63, 23.12],
                            [77.63, 23.15],
                            [77.60, 23.15],
                            [77.60, 23.12]
                        ]
                    ]
                }
            },
            "234/56": {
                "owner": "Anita Gupta",
                "area": 3.1,
                "tehsil": "Sehore",
                "district": "Sehore",
                "state": "Madhya Pradesh",
                "geojson": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [77.48, 23.20],
                            [77.50, 23.20],
                            [77.50, 23.22],
                            [77.48, 23.22],
                            [77.48, 23.20]
                        ]
                    ]
                }
            },
            "567/89": {
                "owner": "Suresh Yadav",
                "area": 2.8,
                "tehsil": "Sehore",
                "district": "Sehore",
                "state": "Madhya Pradesh",
                "geojson": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [77.65, 23.25],
                            [77.68, 23.25],
                            [77.68, 23.28],
                            [77.65, 23.28],
                            [77.65, 23.25]
                        ]
                    ]
                }
            },
        }

    def lookup_khasra(self, khasra_number: str, tehsil: str = None, district: str = None) -> dict:
        """
        Mock lookup of Khasra number in government land records.
        
        Args:
            khasra_number: Khasra/plot number (e.g., "123/45")
            tehsil: Revenue circle name (optional, for real API validation)
            district: District name (optional, for real API validation)
            
        Returns:
            {
                "status": "success",
                "khasra_number": "123/45",
                "owner": "Farmer Name",
                "area_hectares": 2.5,
                "geojson": {...},
                "message": "Land record found successfully"
            }
        """
        # Normalize khasra number (remove spaces, convert to standard format)
        khasra_key = khasra_number.strip().replace(" ", "/")
        
        # Check if khasra exists in our mock database
        if khasra_key not in self.khasra_db:
            # Return 404-style error
            return {
                "status": "not_found",
                "khasra_number": khasra_number,
                "message": f"Khasra number '{khasra_number}' not found in records. Try one of: {', '.join(self.khasra_db.keys())}"
            }
        
        record = self.khasra_db[khasra_key]
        
        # Validate tehsil/district if provided (in production, this would be important)
        if tehsil and record['tehsil'] != tehsil:
            return {
                "status": "mismatch",
                "khasra_number": khasra_number,
                "message": f"Khasra number belongs to {record['tehsil']} tehsil, not {tehsil}"
            }
        
        # Return the land record with GeoJSON polygon
        return {
            "status": "success",
            "khasra_number": khasra_key,
            "owner": record['owner'],
            "area_hectares": record['area'],
            "tehsil": record['tehsil'],
            "district": record['district'],
            "state": record['state'],
            "geojson": record['geojson'],
            "message": f"Land record found: {record['owner']} owns {record['area']} hectares"
        }

    def get_sample_khasras(self) -> list:
        """Return list of available Khasra numbers for testing."""
        return list(self.khasra_db.keys())
