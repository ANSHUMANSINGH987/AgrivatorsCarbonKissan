import google.generativeai as genai
from app.core.config import settings
import json
import os

# Simple cache for responses to reduce API calls
RESPONSE_CACHE_FILE = os.path.join(os.path.dirname(__file__), '../../cache.json')

def load_cache():
    """Load cached responses"""
    if os.path.exists(RESPONSE_CACHE_FILE):
        try:
            with open(RESPONSE_CACHE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_cache(cache):
    """Save cached responses"""
    try:
        os.makedirs(os.path.dirname(RESPONSE_CACHE_FILE), exist_ok=True)
        with open(RESPONSE_CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
    except:
        pass

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = None
        self.model_name = None
        self.cache = load_cache()
        
        # Initialize Gemini only if API key is provided
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                # Don't initialize model here, defer to actual use for better fallback
                print("[OK] Gemini API key configured.")
            except Exception as e:
                print(f"[WARNING] Gemini configuration failed: {e}")
        else:
            print("[WARNING] GEMINI_API_KEY not set. AI features will use intelligent fallbacks.")

    def _get_model(self):
        """Lazy-load model with fallback to mock if API fails."""
        if self.model is not None:
            return self.model
        
        if not self.api_key:
            print("[ERROR] No GEMINI_API_KEY found in environment!")
            return None
        
        # Try multiple model names in order of preference
        model_names = [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-flash-latest',
            'gemini-pro-latest',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-pro-vision'
        ]
        
        for model_name in model_names:
            try:
                print(f"[DEBUG] Attempting to initialize model: {model_name}")
                self.model = genai.GenerativeModel(model_name)
                self.model_name = model_name
                print(f"[OK] Initialized Gemini with model: {model_name}")
                return self.model
            except Exception as e:
                print(f"[DEBUG] Model {model_name} failed with error: {str(e)}")
                continue
        
        print("[ERROR] All Gemini models failed to initialize.")
        return None

    def get_daily_insights(self, region: str, latitude: float = None, longitude: float = None) -> str:
        """Fetches AI-curated actionable farming news for the specific region using Gemini API."""
        # Create cache key with coordinates for more specificity
        cache_key = f"insights:{region}:{latitude}:{longitude}"
        
        # Don't use cache for location-based insights to always get fresh data
        # if cache_key in self.cache:
        #     print(f"[INFO] Using cached insights for: {region}")
        #     return self.cache[cache_key]
        
        model = self._get_model()
        
        # Build coordinate context if available
        coord_context = ""
        if latitude and longitude:
            coord_context = f" (Coordinates: {latitude}°N, {longitude}°E)"
        
        prompt = f"""
        You are an expert agricultural advisor for farmers in {region}, India{coord_context}.
        Today is {__import__('datetime').datetime.now().strftime('%B %d, %Y')}.
        
        Generate 3 HIGHLY RELEVANT and CURRENT actionable farming tips for farmers in this region TODAY:
        
        1. Weather & Field Operations: Provide current weather forecast implications for farming work
        2. Market Intelligence: Latest Mandi (agricultural market) prices and trends for major crops in {region}
        3. Government Support & Schemes: Available subsidies, schemes, or extension services farmers should know about
        
        Format each point as a short, impactful bullet line with emoji and essential info only.
        Use a mix of Hindi and English naturally.
        Maximum 80 words total. Be specific to {region} region.
        Do NOT provide generic information.
        """
        
        try:
            print(f"[DEBUG] Fetching fresh insights from Gemini for {region}")
            response = model.generate_content(prompt)
            text_response = response.text
            self.cache[cache_key] = text_response
            save_cache(self.cache)
            print(f"[OK] Successfully generated fresh insights for {region}")
            return text_response
        except Exception as e:
            # Fallback on error
            print(f"[WARNING] Gemini API failed: {e}")
            response = f"""
            1. ☀️ Weather: Check local weather patterns in {region} for optimal farm work scheduling.
            2. 🌾 Markets: Stay updated with Mandi rates for major crops in your district.
            3. 💰 Schemes: Visit your local Krishi Vigyan Kendra or agricultural office for latest government schemes.
            """
            self.cache[cache_key] = response
            save_cache(self.cache)
            return response

    def generate_chat_response(self, user_message: str, context: dict) -> str:
        """Kisan-Saathi chatbot reasoning engine."""
        print(f"[DEBUG] Generating response for message: {user_message}")
        print(f"[DEBUG] Farm context: {context}")
        
        # Check cache first to reduce API calls
        cache_key = f"chat:{user_message[:50]}"
        if cache_key in self.cache:
            print(f"[INFO] Using cached response for: {user_message[:50]}")
            return self.cache[cache_key]
        
        model = self._get_model()
        
        # Intelligent fallback responses based on user keywords
        def intelligent_fallback(msg: str) -> str:
            msg_lower = msg.lower()
            
            # Carbon farming related
            if any(word in msg_lower for word in ['कार्बन', 'carbon', 'soil', 'मिट्टी', 'खाद', 'fertilizer', 'content', 'badha']):
                return "कार्बन खेती एक बेहद फायदेमंद तरीका है! जैविक खाद, कवर फसलें, और कम जुताई के माध्यम से आप मिट्टी में कार्बन बढ़ा सकते हैं। यह आपकी मिट्टी को स्वस्थ बनाता है और ज्यादा फसल देता है। 🌱\n\n(Carbon farming is very beneficial! Through organic manure, cover crops, and reduced tillage, you can increase carbon in the soil. This makes your soil healthy and produces more crops. 🌱)"
            
            # Scheme and subsidies
            elif any(word in msg_lower for word in ['scheme', 'sarkari', 'suvidha', 'subsidy', 'आर्थिक', 'योजना', 'अनुदान']):
                return "आप प्रधानमंत्री फसल बीमा योजना, प्रधानमंत्री कृषि सिंचाई योजना, और पीएम-किसान जैसी योजनाओं के लिए आवेदन कर सकते हैं। अपने जिले के कृषि विभाग में संपर्क करें। 💰\n\n(You can apply for PM Crop Insurance, PM Agricultural Irrigation Scheme, and PM-Farmer schemes. Contact your district agricultural office. 💰)"
            
            # Weather and seasonal
            elif any(word in msg_lower for word in ['weather', 'बारिश', 'rain', 'temperature', 'गर्मी', 'thaandi', 'season', 'fasal']):
                return "इस बारिश के मौसम में धान, मक्का, और सोयाबीन की अच्छी फसल होती है। नियमित सिंचाई करें और मिट्टी की नमी बनाए रखें। अपनी क्षेत्र की स्थानीय कृषि सलाह लें। 🌧️\n\n(Rice, corn, and soybean grow well in the rainy season. Maintain regular irrigation and soil moisture. Consult your local agriculture office. 🌧️)"
            
            # Yield and productivity
            elif any(word in msg_lower for word in ['yield', 'production', 'उपज', 'पैदावार', 'फसल']):
                return "अच्छी उपज के लिए: (1) बीज की गुणवत्ता जांचें, (2) समय पर बुवाई करें, (3) सही जल प्रबंधन रखें, (4) खरपतवार नियंत्रण करें, (5) कीटों से सतर्क रहें। 🌾\n\n(For good yield: (1) Check seed quality, (2) Sow on time, (3) Maintain proper water management, (4) Control weeds, (5) Stay alert for pests. 🌾)"
            
            # Market and prices
            elif any(word in msg_lower for word in ['price', 'market', 'मंडी', 'दाम', 'बिक्रय']):
                return "मंडी के भाव रोज बदलते हैं। अपने जिले की कृषि मंडी (Agrimarket) या eNAM पोर्टल पर रोज मूल्य चेक करें। कृषि विस्तार अधिकारी भी आपको सलाह दे सकते हैं। 💵\n\n(Market prices change daily. Check your district agricultural market (Agrimarket) or eNAM portal daily. Agricultural extension officers can also advise you. 💵)"
            
            # Irrigation
            elif any(word in msg_lower for word in ['irrigation', 'पानी', 'sichhai', 'sichyai', 'water']):
                return "सिंचाई फसल की सफलता के लिए बहुत महत्वपूर्ण है! ड्रिप सिंचाई पानी बचाता है। गर्मी में हर 5-7 दिन में सिंचाई करें, सर्दी में कम करें। मिट्टी की नमी जांचते रहें। 💧\n\n(Irrigation is very important for crop success! Drip irrigation saves water. Water every 5-7 days in summer, reduce in winter. Keep checking soil moisture. 💧)"
            
            # Default helpful response
            else:
                return f"नमस्ते! मैं किसान-साथी हूँ। आपके सवाल का सटीक जवाब देने के लिए कृपया ज्यादा विस्तार दें। क्या आप कार्बन खेती, सरकारी योजना, मौसम, पैदावार, सिंचाई, या मंडी के बारे में पूछ रहे हैं? 🌾\n\n(Hello! I'm Kisan-Saathi. To answer your question accurately, please provide more details. Are you asking about carbon farming, government schemes, weather, yield, irrigation, or market? 🌾)"
        
        if not model:
            # No model available, use intelligent fallback
            print("[INFO] Gemini model not initialized, using intelligent fallback response")
            response = intelligent_fallback(user_message)
            self.cache[cache_key] = response
            save_cache(self.cache)
            return response
        
        prompt = f"""
        You are 'Kisan-Saathi', a helpful AI assistant for Indian farmers.
        The farmer is asking: "{user_message}"
        
        Here is their farm data context (if any): {context}
        
        Provide a very brief, practical, and empathetic answer in Hindi and English.
        Keep it under 150 words total.
        """
        try:
            print(f"[DEBUG] Calling Gemini API with prompt")
            response = model.generate_content(prompt)
            text_response = response.text
            print(f"[OK] Got response from Gemini: {text_response[:100]}...")
            
            # Cache successful API response
            self.cache[cache_key] = text_response
            save_cache(self.cache)
            
            return text_response
        except Exception as e:
            # Check if it's a quota error or other API error
            error_str = str(e)
            print(f"[WARNING] Gemini API error: {error_str[:200]}")
            
            if "quota" in error_str.lower() or "429" in error_str:
                print("[INFO] Free tier quota exceeded or rate limited, using intelligent fallback")
                response = intelligent_fallback(user_message)
                self.cache[cache_key] = response
                save_cache(self.cache)
                return response
            else:
                # Other API errors
                print(f"[ERROR] Gemini API failed with exception: {error_str}")
                response = intelligent_fallback(user_message)
                self.cache[cache_key] = response
                save_cache(self.cache)
                return response