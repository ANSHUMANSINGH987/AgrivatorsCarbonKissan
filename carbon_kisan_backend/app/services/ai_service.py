import google.generativeai as genai
from app.core.config import settings

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = None
        
        # Initialize Gemini only if API key is provided
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                print("[OK] Gemini AI initialized successfully.")
            except Exception as e:
                print(f"[WARNING] Gemini initialization failed: {e}")
        else:
            print("[WARNING] GEMINI_API_KEY not set. AI features will return mock responses.")

    def get_daily_insights(self, region: str) -> str:
        """Fetches AI-curated actionable news for the specific region."""
        if not self.model:
            # Fallback mock response for development
            return """
            1. ☀️ Sunny weather expected this week - ideal for farm operations.
            2. 🌾 Rice market rates are stable at ₹2,100/quintal.
            3. 💰 Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) accepting applications for irrigation subsidies.
            """
        
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
        if not self.model:
            # Fallback mock response for development
            return f"नमस्ते किसान भाई! आपके सवाल का जवाब देने के लिए खेद है, लेकिन AI सेवा अभी उपलब्ध नहीं है। कृपया बाद में कोशिश करें। (Hello farmer! I'm sorry, but AI services are currently unavailable. Please try again later.)"
        
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