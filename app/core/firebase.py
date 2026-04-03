import os
import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings

def initialize_firebase():
    """Initializes Firebase Admin SDK."""
    if not firebase_admin._apps:
        try:
            if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)
                print("✅ Firebase Initialized successfully.")
            else:
                print("⚠️ Firebase credentials not found. Database features will be disabled.")
        except Exception as e:
            print(f"❌ Firebase init failed: {e}")

def get_db():
    """Returns the Firestore database client."""
    if firebase_admin._apps:
        return firestore.client()
    raise RuntimeError("Firebase is not initialized")