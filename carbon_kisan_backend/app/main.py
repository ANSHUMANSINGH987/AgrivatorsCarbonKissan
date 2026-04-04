from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings
from app.core.firebase import initialize_firebase
import ee

app = FastAPI(title=settings.PROJECT_NAME)

# --- CORS Configuration ---
# Allows your React frontend (e.g., localhost:3000/3001) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Initialize Global Services ---
@app.on_event("startup")
async def startup_event():
    print("Starting up server...")
    
    # 1. Initialize Firebase
    initialize_firebase()
    
    # 2. Initialize Earth Engine
    try:
        ee.Initialize(project=settings.GEE_PROJECT_ID)
        print("[OK] Earth Engine Initialized.")
    except Exception as e:
        print(f"[WARNING] Earth Engine Auth required. Error: {e}")

# --- Register Routes ---
app.include_router(api_router, prefix="/api")

@app.get("/")
def root_check():
    return {"message": "Carbon-Kisan API is running"}