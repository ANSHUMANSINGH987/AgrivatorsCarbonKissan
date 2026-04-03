from fastapi import APIRouter, HTTPException
from app.schemas.ai import InsightsRequest, ChatRequest
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

@router.post("/daily-insights")
async def fetch_insights(request: InsightsRequest):
    try:
        insights = ai_service.get_daily_insights(request.region)
        return {"status": "success", "data": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat_with_bot(request: ChatRequest):
    try:
        reply = ai_service.generate_chat_response(request.message, request.farm_context)
        return {"status": "success", "reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))