import os
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError as e:
    print(f"Warning: Firebase not installed: {e}")
    firebase_admin = None
    credentials = None
    firestore = None

from app.core.config import settings

def initialize_firebase():
    """Initializes Firebase Admin SDK."""
    if not firebase_admin:
        print("[WARNING] Firebase Admin SDK not installed. Database features will be disabled.")
        return
    
    if firebase_admin._apps:
        print("[OK] Firebase already initialized.")
        return
    
    try:
        if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
            print("[OK] Firebase Initialized successfully.")
        else:
            print("[WARNING] Firebase credentials not found. Database features will be disabled.")
    except Exception as e:
        print(f"[ERROR] Firebase init failed: {e}")

def get_db():
    """Returns the Firestore database client."""
    if not firebase_admin or not firebase_admin._apps:
        raise RuntimeError("Firebase is not initialized")
    return firestore.client()