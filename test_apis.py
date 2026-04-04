#!/usr/bin/env python
"""Test API endpoints to identify issues"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_land_boundary():
    print("\n=== Testing Land Boundary Detection ===")
    try:
        resp = requests.post(
            f"{BASE_URL}/land/auto-boundary",
            json={"lat": 23.1815, "lon": 79.9864},
            timeout=10
        )
        print(f"✓ Status: {resp.status_code}")
        data = resp.json()
        print(f"✓ Response keys: {list(data.keys())}")
        if resp.status_code == 200 and "geojson" in data:
            print("✓ GeoJSON generated successfully")
            return data["geojson"]
        else:
            print(f"✗ Unexpected response: {data}")
            return None
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {e}")
        return None

def test_daily_insights():
    print("\n=== Testing Daily Insights ===")
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/daily-insights",
            json={"region": "Madhya Pradesh"},
            timeout=10
        )
        print(f"Status: {resp.status_code}")
        if resp.status_code != 200:
            print(f"✗ Error Response: {resp.json()}")
        else:
            data = resp.json()
            print(f"✓ Data received: {str(data)[:100]}...")
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {e}")

def test_mrv_analysis(geojson):
    print("\n=== Testing MRV Analysis ===")
    if not geojson:
        print("✗ Cannot test MRV without geojson from land boundary")
        return
    
    try:
        payload = {
            "farmer_id": "test_farmer_001",
            "location_name": "Test Farm",
            "polygon": {"coordinates": geojson.get("coordinates", [])}
        }
        print(f"Payload: {json.dumps(payload, indent=2)[:200]}...")
        
        resp = requests.post(
            f"{BASE_URL}/mrv/analyze",
            json=payload,
            timeout=30
        )
        print(f"Status: {resp.status_code}")
        data = resp.json()
        
        if resp.status_code == 200:
            print("✓ MRV Analysis successful")
            print(f"✓ Keys: {list(data.keys())}")
            for key in ["farm_area_hectares", "estimated_carbon_tonnes", "certificate_id"]:
                if key in data:
                    print(f"  {key}: {data[key]}")
        else:
            print(f"✗ Error: {data}")
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {e}")

def test_chat():
    print("\n=== Testing AI Chat ===")
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/chat",
            json={
                "message": "नमस्ते, मेरे खेत का साइज बताओ",
                "farm_context": {"size_hectares": 5}
            },
            timeout=10
        )
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            reply = data.get("reply", "")
            print(f"✓ Reply: {reply[:100]}...")
        else:
            print(f"✗ Error: {resp.json()}")
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {e}")

if __name__ == "__main__":
    print("🧪 CARBON KISAN API TEST SUITE")
    print("=" * 50)
    
    # Test land boundary first (needed for MRV)
    geojson = test_land_boundary()
    
    # Test other endpoints
    test_daily_insights()
    test_chat()
    test_mrv_analysis(geojson)
    
    print("\n" + "=" * 50)
    print("✅ Test suite complete")
