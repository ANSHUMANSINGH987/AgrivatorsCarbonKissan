from fastapi import APIRouter
from app.api.endpoints import land, mrv, ai, docs

api_router = APIRouter()

api_router.include_router(land.router, prefix="/land", tags=["Land Mapping"])
api_router.include_router(mrv.router, prefix="/mrv", tags=["MRV Engine"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI & Voice"])
api_router.include_router(docs.router, prefix="/docs", tags=["Documents"])