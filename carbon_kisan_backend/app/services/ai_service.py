import google.generativeai as genai
from app.core.config import settings

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = None
        self.model_name = None
        
        # Initialize Gemini only if API key is provided
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                # Don't initialize model here, defer to actual use for better fallback
                print("[OK] Gemini API key configured.")
            except Exception as e:
                print(f"[WARNING] Gemini configuration failed: {e}")
        else:
            print("[WARNING] GEMINI_API_KEY not set. AI features will return mock responses.")

    def _get_model(self):
        """Lazy-load model with fallback to mock if API fails."""
        if self.model is not None:
            return self.model
        
        if not self.api_key:
            return None
        
        # Try multiple model names in order of preference
        model_names = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-pro-vision'
        ]
        
        for model_name in model_names:
            try:
                self.model = genai.GenerativeModel(model_name)
                self.model_name = model_name
                print(f"[OK] Initialized Gemini with model: {model_name}")
                return self.model
            except Exception as e:
                print(f"[DEBUG] Model {model_name} failed: {str(e)}")
                continue
        
        print("[WARNING] All Gemini models failed. Using mock responses.")
        return None

    def get_daily_insights(self, region: str) -> str:
        """Fetches AI-curated actionable news for the specific region."""
        model = self._get_model()
        if not model:
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
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            # Fallback on error
            print(f"[WARNING] Gemini API failed: {e}")
            return """
            1. ☀️ Sunny weather expected this week - ideal for farm operations.
            2. 🌾 Current market trends showing stability.
            3. 💰 Check your local agricultural extension office for schemes.
            """

    def generate_chat_response(self, user_message: str, context: dict) -> str:
        """Kisan-Saathi chatbot reasoning engine."""
        model = self._get_model()
        if not model:
            # Fallback mock response for development
            return f"नमस्ते किसान भाई! आपके सवाल का जवाब देने के लिए खेद है, लेकिन AI सेवा अभी उपलब्ध नहीं है। कृपया बाद में कोशिश करें। (Hello farmer! I'm sorry, but AI services are currently unavailable. Please try again later.)"
        
        prompt = f"""
        You are 'Kisan-Saathi', a helpful AI assistant for Indian farmers.
        The farmer is asking: "{user_message}"
        
        Here is their farm data context (if any): {context}
        
        Provide a very brief, practical, and empathetic answer in Hindi.
        """
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            # Fallback on error
            print(f"[WARNING] Gemini API failed: {e}")
            return "मुझे खेद है, लेकिन अभी मैं आपकी सहायता नहीं कर सकता। कृपया बाद में कोशिश करें। (I'm sorry, but I can't help you right now. Please try again later.)"