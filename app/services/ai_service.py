import google.generativeai as genai
from app.core.config import settings

class AIService:
    def __init__(self):
        # Configure Gemini with your API Key
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def get_daily_insights(self, region: str) -> str:
        """Fetches AI-curated actionable news for the specific region."""
        prompt = f"""
        Act as an expert agronomist for {region}, India. 
        Provide 3 highly relevant, short bullet points for a farmer today:
        1. Local Weather Alert.
        2. Current Mandi rate trend for a major local crop.
        3. One relevant Government Scheme they can apply for.
        Keep it under 100 words. Write it in clear Hindi.
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"AI Insight Generation Failed: {e}")

    def generate_chat_response(self, user_message: str, context: dict) -> str:
        """Kisan-Saathi chatbot reasoning engine."""
        prompt = f"""
        You are 'Kisan-Saathi', a helpful AI assistant for Indian farmers.
        The farmer is asking: "{user_message}"
        
        Here is their farm data context (if any): {context}
        
        Provide a very brief, practical, and empathetic answer in Hindi.
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"AI Chat Failed: {e}")