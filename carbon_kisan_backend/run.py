#!/usr/bin/env python
"""Simple startup script for Carbon Kisan Backend"""
import sys
import os

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
