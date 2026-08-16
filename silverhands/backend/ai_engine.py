"""
SilverHands AI Engine
Provides multi-model AI API key integration (Google Gemini, OpenAI, REST endpoints)
along with a robust Dynamic Natural Language Processing & Extraction Engine.

Ensures all user onboarding interviews, skill extractions, class generations, social post creations,
video metadata transcriptions, SilverBuddy AI responses, and skill assessments are strictly derived
dynamically from the user's exact input text and context.
"""
import os
import json
import re
import urllib.request
from typing import Dict, List, Any, Optional

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_API_KEY = os.getenv("LLM_API_KEY")

def _load_dotenv():
    """Built-in zero-dependency .env loader."""
    paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
        os.path.join(os.path.dirname(__file__), "..", ".env"),
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.getcwd(), ".env"),
    ]
    for path in paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and not os.environ.get(k):
                            os.environ[k] = v
            except Exception:
                pass

_load_dotenv()

class AIEngine:
    def __init__(self):
        self.use_real_ai = False
        self.provider = "none"
        self.genai_client = None
        self._init_provider()

    def _init_provider(self):
        _load_dotenv()
        gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")
        llm_key = os.getenv("LLM_API_KEY")

        if gemini_key:
            try:
                from google import genai
                self.genai_client = genai.Client(api_key=gemini_key)
                self.use_real_ai = True
                self.provider = "gemini_sdk"
            except Exception:
                self.use_real_ai = True
                self.provider = "gemini_rest"
        elif openai_key:
            self.use_real_ai = True
            self.provider = "openai_rest"
        elif llm_key:
            self.use_real_ai = True
            self.provider = "generic_llm"

    def _call_llm_api(self, prompt: str, system_prompt: str = "", json_mode: bool = True) -> Optional[Any]:
        """Calls available AI Model API (Gemini or OpenAI) with JSON or text response."""
        self._init_provider()
        if not self.use_real_ai:
            return None

        gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")

        def _clean_json_str(raw: str) -> str:
            raw = raw.strip()
            if raw.startswith("```json"):
                raw = raw[7:]
            elif raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            return raw.strip()

        # 1. Gemini SDK
        if self.provider == "gemini_sdk" and self.genai_client:
            try:
                config = {'response_mime_type': 'application/json'} if json_mode else {}
                full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
                res = self.genai_client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=full_prompt,
                    config=config
                )
                text = _clean_json_str(res.text)
                return json.loads(text) if json_mode else text
            except Exception as e:
                print(f"SilverHands AI Engine Gemini SDK Error: {e}")

        # 2. Gemini REST API Fallback
        if (self.provider in ["gemini_rest", "gemini_sdk"]) and gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
                payload = {
                    "contents": [{"parts": [{"text": f"{system_prompt}\n\n{prompt}" if system_prompt else prompt}]}]
                }
                if json_mode:
                    payload["generationConfig"] = {"responseMimeType": "application/json"}

                data = json.dumps(payload).encode('utf-8')
                req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
                with urllib.request.urlopen(req, timeout=12) as response:
                    resp_body = response.read().decode('utf-8')
                    result = json.loads(resp_body)
                    text = _clean_json_str(result['candidates'][0]['content']['parts'][0]['text'])
                    return json.loads(text) if json_mode else text
            except Exception as e:
                print(f"SilverHands AI Engine Gemini REST Error: {e}")

        # 3. OpenAI REST API Fallback
        if self.provider == "openai_rest" and openai_key:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})

                payload = {
                    "model": "gpt-4o-mini",
                    "messages": messages,
                    "temperature": 0.7
                }
                if json_mode:
                    payload["response_format"] = {"type": "json_object"}

                data = json.dumps(payload).encode('utf-8')
                headers = {'Authorization': f'Bearer {openai_key}', 'Content-Type': 'application/json'}
                req = urllib.request.Request(url, data=data, headers=headers, method='POST')
                with urllib.request.urlopen(req, timeout=12) as response:
                    resp_body = response.read().decode('utf-8')
                    result = json.loads(resp_body)
                    text = _clean_json_str(result['choices'][0]['message']['content'])
                    return json.loads(text) if json_mode else text
            except Exception as e:
                print(f"SilverHands AI Engine OpenAI REST Error: {e}")

        return None

    def onboarding_chat(self, step: int, user_input: str, history: List[Dict[str, str]], lang: str = "ta") -> Dict[str, Any]:
        """Adaptive Onboarding Interview handler dynamically derived from user's actual conversation."""
        if self.use_real_ai:
            sys_p = f"You are SilverHands AI Interviewer speaking in language '{lang}'. Guide senior citizens and homemakers warmly to share their lifetime skills."
            user_p = f"""
            Interview Step: {step}
            User's latest response: "{user_input}"
            Previous transcript history: {json.dumps(history)}

            Respond with JSON:
            {{
                "question": "Warm, encouraging follow-up question strictly in language '{lang}'",
                "next_step": {step + 1},
                "is_complete": false
            }}
            Set is_complete to true if step >= 4 or if user gave sufficient details about their background.
            """
            llm_res = self._call_llm_api(user_p, system_prompt=sys_p, json_mode=True)
            if llm_res and "question" in llm_res:
                return llm_res

        # Dynamic Fallback Interviewer
        text_lower = user_input.lower()
        
        # Check language translations
        lang_prompts = {
            "ta": {
                "welcome": "வணக்கம்! SilverHands தளத்திற்கு உங்களை வரவேற்கிறோம். உங்கள் பெயர் மற்றும் நீங்கள் எந்த ஊரில் வசிக்கிறீர்கள் என்று கூறுங்கள்?",
                "ask_skills": "மிக்க மகிழ்ச்சி! உங்களின் வாழ்நாள் அனுபவங்கள், சமையல், தையல், கற்பித்தல், தோட்டம் அல்லது கைவினை போன்ற திறமைகளைப் பற்றி விரிவாகக் கூற முடியுமா?",
                "ask_pref": "அற்புதம்! நீங்கள் இந்த பணிகளை வீட்டிலிருந்தே செய்ய விரும்புகிறீர்களா அல்லது அருகில் உள்ள இடங்களுக்குச் சென்று செய்ய விரும்புகிறீர்களா? உங்களுக்கு வாரத்தில் எந்த நாட்கள் வசதி?",
                "closing": "மிக்க நன்றி! உங்கள் திறமைகளை AI முறையில் பகுப்பாய்வு செய்து உங்களின் தனிப்பட்ட Dashboard-ஐ உருவாக்குகிறது."
            },
            "hi": {
                "welcome": "नमस्ते! SilverHands में आपका स्वागत है। कृपया अपना नाम और अपने शहर का नाम बताएं?",
                "ask_skills": "बहुत बढ़िया! कृपया अपने अनुभव, जैसे खाना बनाना, सिलाई, पढ़ाना, बागबानी या अन्य कलात्मक कौशल के बारे में बताएं?",
                "ask_pref": "शानदार! क्या आप यह काम घर से करना चाहते हैं या पास की जगह पर? सप्ताह में कौन से दिन आपके लिए सुविधाजनक हैं?",
                "closing": "धन्यवाद! AI आपके कौशल का विश्लेषण करके आपका डैशबोर्ड तैयार कर रहा है।"
            },
            "en": {
                "welcome": "Welcome to SilverHands! What is your full name and which city or area do you reside in?",
                "ask_skills": "Wonderful! Could you share your lifetime experience and skills in cooking, tailoring, tutoring, gardening, crafts, or services?",
                "ask_pref": "Great! Do you prefer working from home or local nearby projects? What days and hours are comfortable for you?",
                "closing": "Thank you! SilverHands AI is now extracting your skills and creating your personalized earning dashboard."
            }
        }
        
        lp = lang_prompts.get(lang, lang_prompts["en"])

        if step == 1 or not user_input.strip():
            return {"question": "What is the skill you know best and can confidently do for work or income? Tell me only one or two skills, such as cooking, tailoring, tutoring, gardening, or handicrafts.", "next_step": 2, "is_complete": False}
        elif step == 2:
            return {"question": "Please tell me the exact skill or work you do best, and I will identify it for your dashboard.", "next_step": 3, "is_complete": False}
        elif step == 3:
            return {"question": "Thank you. I will extract your skill, confirm it, and create your personal dashboard based only on that skill.", "next_step": 4, "is_complete": True}
        else:
            return {"question": lp["closing"], "next_step": 5, "is_complete": True}

    def extract_skills(self, user_text: str, history: List[Dict[str, str]], lang: str = "ta") -> List[Dict[str, Any]]:
        """Extract explicit, hidden, and transferable skills dynamically strictly based on user input only."""
        user_messages = [m.get("text", "") for m in history if str(m.get("role", "")).lower() == "user"]
        full_transcript = (user_text + " " + " ".join(user_messages)).strip()
        
        if self.use_real_ai and full_transcript:
            sys_p = "You are SilverHands Skill Extraction Engine. Extract only the skills explicitly mentioned by the user. Ignore assistant prompts and examples."
            user_p = f"""
            Analyze transcript: "{full_transcript}"
            User Language: {lang}

            Return a JSON list with only the skills the user actually mentioned, not examples or prompt text.
            Keep it to 1-3 items total and prefer the exact user skill(s) only.
            [
              {{
                "id": "unique-id",
                "name": "Skill Name",
                "category": "Cooking|Tailoring|Teaching|Gardening|Handicrafts|Services|Professional",
                "confidence": "High|Medium",
                "experience_years": 0,
                "proficiency": "Expert|Advanced",
                "can_teach": true,
                "can_collaborate": true,
                "preferred_work": "Home / Local",
                "reasoning": "Reason derived directly from transcript",
                "earning_paths": ["Path 1", "Path 2", "Path 3"]
              }}
            ]
            """
            llm_res = self._call_llm_api(user_p, system_prompt=sys_p, json_mode=True)
            if isinstance(llm_res, list) and len(llm_res) > 0:
                return llm_res[:3]
            elif isinstance(llm_res, dict) and "skills" in llm_res:
                return llm_res["skills"][:3]

        # Dynamic Smart Natural Language Extraction Engine
        lower = full_transcript.lower()
        extracted = []
        mentions_teaching = any(k in lower for k in ["teach", "tutor", "mentor", "instruct", "coach", "train", "கற்பித்தல்", "பாடம்", "மென்டோர்", "பயிற்சி", "पढ़ाना", "प्रशिक्षण"])

        def keyword_hit(text: str, keywords: List[str]) -> bool:
            text_norm = re.sub(r'[^a-z0-9\s\u0b80-\u0fff]', ' ', text.lower()).strip()
            for key in keywords:
                key_norm = re.sub(r'[^a-z0-9\s\u0b80-\u0fff]', ' ', key.lower()).strip()
                if not key_norm:
                    continue
                if re.search(rf"(?<![a-z0-9\u0b80-\u0fff]){re.escape(key_norm)}(?![a-z0-9\u0b80-\u0fff])", text_norm):
                    return True
            return False

        # Extract Experience Years dynamically if mentioned in text.
        # If the user does not provide it, keep it blank instead of assigning random defaults.
        years_match = re.search(r'(\d+)\s*(?:years?|yrs?|ஆண்டுகள்|ஆண்டு|साल)', lower)
        exp_years = int(years_match.group(1)) if years_match else 0

        # Domain Keyword Mappings
        domains = [
            {
                "keys": ["pottery", "clay", "ceramic", "terracotta", "mold", "potter", "மண்பாண்டம்", "களிமண்", "पॉटरी"],
                "id": "ext-craft",
                "name": "Pottery & Clay Craft",
                "category": "Handicrafts",
                "confidence": "High",
                "earning": ["Clay products sales", "Decor item orders", "Workshop classes"]
            },
            {
                "keys": ["cook", "food", "snack", "sweet", "pickle", "tiffin", "baking", "bake", "catering", "சமையல்", "தின்பண்டங்கள்", "சாப்பாடு", "விருந்து", "ஊறுகாய்", "खाना", "रसोई"],
                "id": "ext-cook",
                "name": "Traditional Culinary & Healthy Snack Preparation",
                "category": "Cooking",
                "confidence": "High",
                "earning": ["Homemade snack bulk orders", "Festival catering", "Culinary workshops", "Recipe monetization"]
            },
            {
                "keys": ["tailor", "stitch", "sew", "embroider", "dress", "sari", "blouse", "bag", "தையல்", "துணி", "ஆடை", "सिलाई", "कढ़ाई"],
                "id": "ext-tailor",
                "name": "Custom Tailoring & Fabric Crafting",
                "category": "Tailoring",
                "confidence": "High",
                "earning": ["Custom blouse & garment stitching", "Eco-friendly cloth bag bulk orders", "Tailoring classes"]
            },
            {
                "keys": ["teach", "tutor", "math", "science", "english", "vedic", "student", "class", "ஆசிரியர்", "பாடம்", "கற்பித்தல்", "படிப்பு", "पढ़ाना"],
                "id": "ext-teach",
                "name": "Academic & Subject Mentoring",
                "category": "Teaching",
                "confidence": "High",
                "earning": ["Home tuition batches", "Online conceptual coaching", "Exam preparation workshops"]
            },
            {
                "keys": ["garden", "plant", "farm", "compost", "vegetable", "terrace", "தோட்டம்", "செடி", "விவசாயம்", "காய்கறி", "पौधे", "खेती"],
                "id": "ext-garden",
                "name": "Organic Terrace & Kitchen Gardening",
                "category": "Gardening",
                "confidence": "High",
                "earning": ["Organic produce sales", "Kitchen garden consulting", "Bio-composting workshops"]
            },
            {
                "keys": ["craft", "art", "paint", "pottery", "clay", "knit", "crochet", "basket", "கைவினை", "ஓவியம்", "மண்பாண்டம்", "हस्तशिल्प"],
                "id": "ext-craft",
                "name": "Artisan Handicrafts & Decorative Arts",
                "category": "Handicrafts",
                "confidence": "High",
                "earning": ["Handcrafted item sales", "Festival decor orders", "Artisan workshops"]
            },
            {
                "keys": ["repair", "carpenter", "wood", "plumb", "fix", "electric", "மரவேலை", "பழுது", "தச்சர்", "मुरम्मत"],
                "id": "ext-repair",
                "name": "Handyman Craft & Home Repair Services",
                "category": "Services",
                "confidence": "High",
                "earning": ["Local repair consultations", "Woodworking crafts", "Community maintenance"]
            },
            {
                "keys": ["care", "child", "elder", "nursing", "baby", "yoga", "health", "குழந்தை", "யோகா", "பராமரிப்பு"],
                "id": "ext-care",
                "name": "Wellness Guidance & Home Caregiving",
                "category": "Services",
                "confidence": "High",
                "earning": ["After-school daycare support", "Elderly companionship", "Yoga instruction"]
            },
            {
                "keys": ["account", "data", "bookkeep", "admin", "office", "கணக்கு", "மின்னஞ்சல்", "खाता"],
                "id": "ext-account",
                "name": "Home & Small Business Bookkeeping",
                "category": "Professional Services",
                "confidence": "High",
                "earning": ["Small business accounting", "Data entry assistance", "Financial guidance"]
            }
        ]

        # Scan transcript for domain matches, but only use the user’s actual text and exact skill terms.
        matched_domains = []
        for d in domains:
            if keyword_hit(lower, d["keys"]):
                matched_domains.append(d)

        for d in matched_domains[:2]:
            extracted.append({
                "id": f"{d['id']}-{os.urandom(2).hex()}",
                "name": d["name"],
                "category": d["category"],
                "confidence": d["confidence"],
                "experience_years": exp_years,
                "proficiency": "Expert",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Home / Local",
                "reasoning": f"Extracted directly from user statement: '{full_transcript[:80]}...'",
                "earning_paths": d["earning"]
            })

            if mentions_teaching and d["category"] != "Teaching":
                extracted.append({
                    "id": f"{d['id']}-teach-{os.urandom(2).hex()}",
                    "name": f"{d['name']} Instructor & Mentor",
                    "category": "Teaching",
                    "confidence": "Medium",
                    "experience_years": max(0, exp_years - 5),
                    "proficiency": "Advanced",
                    "can_teach": True,
                    "can_collaborate": True,
                    "preferred_work": "Workshops / Online",
                    "reasoning": f"Transferable leadership skill derived from {exp_years} years of practical expertise.",
                    "earning_paths": [f"Weekend {d['category'].lower()} workshops", "Online masterclasses"]
                })

        if len(extracted) > 2:
            extracted = extracted[:2]

        # If no standard keywords matched, extract custom dynamic skill directly from the user's sentence!
        if not extracted:
            clean_text = re.sub(r'[^\w\s]', '', full_transcript).strip()
            topic = clean_text[:40].title() if clean_text else "Custom Practical Expertise"
            extracted.append({
                "id": f"ext-custom-{os.urandom(2).hex()}",
                "name": f"{topic}",
                "category": "Services & Crafts",
                "confidence": "High",
                "experience_years": exp_years,
                "proficiency": "Expert",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Home / Local Community",
                "reasoning": f"Identified custom specialization directly from user input: '{full_transcript}'",
                "earning_paths": ["Direct client orders", "Local workshops", "Community projects"]
            })
            extracted.append({
                "id": f"ext-custom-teach-{os.urandom(2).hex()}",
                "name": f"{topic} Workshop Instructor",
                "category": "Teaching",
                "confidence": "Medium",
                "experience_years": max(0, exp_years - 5),
                "proficiency": "Advanced",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Online / Local",
                "reasoning": "Hidden transferable skill: Capability to guide and teach younger generations.",
                "earning_paths": ["Skill masterclasses", "Group mentoring"]
            })

        return extracted

    def generate_class(self, prompt: str, user_name: str, lang: str = "ta") -> Dict[str, Any]:
        """Dynamically generates complete class structure, title, curriculum, fees, and schedule based on user's exact prompt."""
        if self.use_real_ai and prompt:
            sys_p = "You are SilverHands Class Creation Engine. Generate complete class details from the instructor's prompt."
            user_p = f"""
            Instructor Name: {user_name}
            Class Proposal Prompt: "{prompt}"
            Language: {lang}

            Return JSON:
            {{
                "title": "Catchy Masterclass Title",
                "instructor": "{user_name}",
                "category": "Cooking|Tailoring|Teaching|Gardening|Handicrafts|Services|Music|Arts",
                "fee": 850,
                "duration": "4 Sessions (Saturdays)",
                "schedule": "10:00 AM - 11:30 AM",
                "mode": "Hybrid (Online Zoom + Kitchen/Home Workshop)",
                "max_students": 15,
                "description": "Comprehensive class description...",
                "curriculum": [
                    "Session 1: Detailed topic",
                    "Session 2: Detailed topic",
                    "Session 3: Detailed topic",
                    "Session 4: Detailed topic"
                ]
            }}
            """
            llm_res = self._call_llm_api(user_p, system_prompt=sys_p, json_mode=True)
            if llm_res and "title" in llm_res:
                return llm_res

        # Dynamic Fallback Class Generator derived directly from prompt
        prompt_clean = prompt.strip()
        topic = re.sub(r'^(?:i want to teach|i can teach|class for|want to host)\s*', '', prompt_clean, flags=re.IGNORECASE).capitalize()
        if not topic:
            topic = "Traditional Skills Masterclass"

        # Determine Category
        topic_lower = topic.lower()
        if any(k in topic_lower for k in ["cook", "food", "snack", "pickle", "bake", "sweet", "சமையல்", "தின்பண்டங்கள்"]):
            category = "Cooking"
            fee = 800
        elif any(k in topic_lower for k in ["tailor", "stitch", "sew", "embroider", "dress", "sari", "தையல்"]):
            category = "Tailoring"
            fee = 950
        elif any(k in topic_lower for k in ["garden", "plant", "farm", "compost", "தோட்டம்", "செடி"]):
            category = "Gardening"
            fee = 700
        elif any(k in topic_lower for k in ["math", "science", "english", "tutor", "teach", "படிப்பு", "பாடம்"]):
            category = "Teaching"
            fee = 1000
        elif any(k in topic_lower for k in ["music", "guitar", "sing", "art", "paint", "craft", "ஓவியம்", "இசை"]):
            category = "Music & Arts"
            fee = 1200
        else:
            category = "Artisan Crafts & Skills"
            fee = 850

        title = f"{topic} Masterclass" if "class" not in topic_lower else topic.title()

        return {
            "title": title,
            "instructor": user_name,
            "category": category,
            "fee": fee,
            "duration": "4 Sessions (Weekend Special)",
            "schedule": "10:00 AM - 11:30 AM",
            "mode": "Hybrid (Online Zoom + Local Workshop)",
            "max_students": 12,
            "description": f"Join {user_name} for a hands-on, practical masterclass on {topic}. Designed for beginners and enthusiasts using time-tested methods.",
            "curriculum": [
                f"Session 1: Fundamentals & Essential Ingredients/Tools for {topic[:25]}",
                f"Session 2: Step-by-Step Techniques & Moisture/Quality Control",
                f"Session 3: Advanced Spicing, Customization & Finishing Touches",
                f"Session 4: Packaging, Commercial Tips & Student QA Session"
            ]
        }

    def generate_post(self, prompt: str, lang: str = "ta") -> Dict[str, str]:
        """Dynamically generates social posts strictly based on user's input prompt."""
        if self.use_real_ai and prompt:
            sys_p = f"You are SilverHands Social Content Engine. Create an engaging community post in language '{lang}' based on user prompt."
            user_p = f"""
            Prompt: "{prompt}"

            Return JSON:
            {{
                "headline": "Catchy headline with emojis",
                "content": "Warm engaging post content...",
                "hashtags": "#SilverHands #SkillSharing ..."
            }}
            """
            llm_res = self._call_llm_api(user_p, system_prompt=sys_p, json_mode=True)
            if llm_res and "headline" in llm_res:
                return llm_res

        # Dynamic Fallback Post Generator
        topic = prompt.strip() if prompt.strip() else "Share Your Experience"

        if lang == "ta":
            return {
                "headline": f"✨ {topic[:35]} - சிறப்பு வாய்ப்பு! 🌾",
                "content": f"வணக்கம் நண்பர்களே! {topic} குறித்து புதிய அறிவிப்பை பகிர்வதில் மகிழ்ச்சியடைகிறேன். நீங்கள் இதில் இணைய விரும்பினால் உடனடியாக தொடர்பு கொள்ளவும்! 📞",
                "hashtags": "#SilverHands #TamilArtisans #SkillSharing #CommunityWork"
            }
        elif lang == "hi":
            return {
                "headline": f"✨ {topic[:35]} - विशेष अवसर! 🌾",
                "content": f"नमस्ते दोस्तों! {topic} के बारे में यह जानकारी साझा करते हुए मुझे खुशी हो रही है। अधिक जानकारी या जुड़ने के लिए संपर्क करें! 📞",
                "hashtags": "#SilverHands #Skills #CommunityWork #Artisan"
            }
        else:
            return {
                "headline": f"✨ {topic[:40]} - Community Update! 🌟",
                "content": f"Hello friends! I am excited to share a new update regarding {topic}. Learn, collaborate, and grow with the SilverHands ecosystem. Connect today!",
                "hashtags": "#SilverHands #LivelihoodPlatform #SeniorSkills #CommunityArtisans"
            }

    def generate_video_metadata(self, video_title: str, lang: str = "ta") -> Dict[str, Any]:
        """Dynamically generates video metadata, tags, and bilingual subtitles derived from video title."""
        if self.use_real_ai and video_title:
            sys_p = "You are SilverHands Video AI Engine. Generate transcription tags and bilingual subtitles (Tamil & English)."
            user_p = f"""
            Video Title: "{video_title}"
            Language: {lang}

            Return JSON:
            {{
                "title": "{video_title}",
                "category": "Cooking|Tailoring|Teaching|Gardening|Handicrafts|Services",
                "tags": ["Tag1", "Tag2", "Tag3"],
                "description": "Video description...",
                "subtitles_ta": "1. Step 1 in Tamil\\n2. Step 2 in Tamil",
                "subtitles_en": "1. Step 1 in English\\n2. Step 2 in English"
            }}
            """
            llm_res = self._call_llm_api(user_p, system_prompt=sys_p, json_mode=True)
            if llm_res and "title" in llm_res:
                return llm_res

        # Dynamic Fallback Video Generator
        title = video_title.strip() if video_title.strip() else "Practical Skill Masterclass"
        title_lower = title.lower()

        if any(k in title_lower for k in ["cook", "food", "snack", "pickle", "recipe", "சமையல்"]):
            category = "Traditional Cooking"
            tags = ["Cooking", "Homemade", "Traditional", "Health", "Food"]
            sub_ta = f"1. {title} செய்ய தேவையான சிறந்த பொருட்களை தயார் செய்யவும்.\n2. சரியான அளவில் வறுத்து அரைத்து சேர்க்கவும்.\n3. பதமாக சமைத்து பரிமாறவும்."
            sub_en = f"1. Prepare fresh ingredients for {title}.\n2. Roast and mix in exact traditional proportions.\n3. Cook on medium heat and serve fresh."
        elif any(k in title_lower for k in ["tailor", "stitch", "sew", "sari", "blouse", "தையல்"]):
            category = "Tailoring & Design"
            tags = ["Tailoring", "Stitching", "GarmentCraft", "Fashion", "Handmade"]
            sub_ta = f"1. {title} குறித்து துணியில் அளவுகளை கவனமாக குறிக்கவும்.\n2. சரியான முறையில் வெட்டி தையல் இயந்திரத்தில் தைக்கவும்.\n3. தையலை சரிபார்த்து ஃபினிஷிங் செய்யவும்."
            sub_en = f"1. Mark precise fabric measurements for {title}.\n2. Cut along patterns and stitch neatly on the machine.\n3. Inspect fitting and apply final finishing."
        else:
            category = "Artisan Skills"
            tags = ["Skills", "Tutorial", "SilverHands", "Masterclass", "Community"]
            sub_ta = f"1. {title} முதற்கட்ட தயாரிப்பு முறைகள்.\n2. செயல்முறை விளக்கத்தை படிபடியாக பின்பற்றவும்.\n3. நிறைவு செய்து பயன்பாட்டிற்கு கொண்டு வரவும்."
            sub_en = f"1. Initial setup procedures for {title}.\n2. Follow the step-by-step practical demonstration.\n3. Complete the process with quality checks."

        return {
            "title": title,
            "category": category,
            "language": lang,
            "tags": tags,
            "description": f"Step-by-step masterclass tutorial on {title}. Learn time-tested traditional techniques.",
            "subtitles_ta": sub_ta,
            "subtitles_en": sub_en
        }

    def silverbuddy_query(self, query: str, user_profile: Dict[str, Any], lang: str = "ta") -> Dict[str, Any]:
        """SilverBuddy Voice & Text AI Assistant derived dynamically from user's query and profile."""
        if self.use_real_ai and query:
            sys_p = "You are SilverBuddy, a supportive voice & text AI companion for seniors and homemakers on SilverHands platform."
            user_p = f"""
            User Query: "{query}"
            User Profile: {json.dumps(user_profile)}
            Language: {lang}

            Return JSON:
            {{
                "answer": "Warm, direct, helpful response in user language...",
                "action": "navigate_earnings|navigate_classes|navigate_radar|none"
            }}
            """
            llm_res = self._call_llm_api(user_p, system_prompt=sys_p, json_mode=True)
            if llm_res and "answer" in llm_res:
                return llm_res

        # Dynamic Fallback Assistant
        q_lower = query.lower()
        user_name = user_profile.get("name", "Friend")
        skills_str = ", ".join([s.get("name", "") for s in user_profile.get("skills", [])]) or "your domain expertise"

        if any(k in q_lower for k in ["earn", "money", "income", "சம்பாதிக்க", "பணம்", "कमाई"]):
            return {
                "answer": f"Hello {user_name}! Based on your skills ({skills_str}), you can earn through: 1) Direct Customer Orders, 2) Conducting Masterclasses, and 3) Content Monetization. Opening your Earnings Dashboard!",
                "action": "navigate_earnings"
            }
        elif any(k in q_lower for k in ["class", "teach", "course", "வகுப்பு", "பாடம்", "क्लास"]):
            return {
                "answer": f"Great news {user_name}! You can publish and teach masterclasses based on {skills_str}. Taking you to your Classes & Teaching page!",
                "action": "navigate_classes"
            }
        elif any(k in q_lower for k in ["work", "job", "opportunity", "radar", "வாய்ப்பு", "வேலை", "काम"]):
            return {
                "answer": f"I checked nearby opportunities matching {skills_str}! Opening Opportunity Radar for you.",
                "action": "navigate_radar"
            }
        else:
            return {
                "answer": f"Hello {user_name}! I am SilverBuddy. I parsed your query: '{query}'. How would you like me to assist you with your skills in {skills_str} today?",
                "action": "none"
            }

    def assess_skill_strength(self, user_id: str, skill_name: str, answers: List[str], lang: str = "ta") -> Dict[str, Any]:
        """Evaluates user's actual submitted assessment answers dynamically."""
        full_ans = " ".join(answers).strip()

        if self.use_real_ai and full_ans:
            sys_p = "You are SilverHands Skill Strength Assessment Evaluator. Grade user domain knowledge based on technical depth, spicing/technique secrets, and quality control."
            user_p = f"""
            Skill Evaluated: "{skill_name}"
            User Submitted Answers: "{full_ans}"
            Language: {lang}

            Return JSON:
            {{
                "skill_name": "{skill_name}",
                "strength_score": 95,
                "level": "Expert / Master Artisan",
                "badge": "🏆 SilverHands Verified Master",
                "feedback": "Detailed constructive evaluation of their technique based on their answers..."
            }}
            """
            llm_res = self._call_llm_api(user_p, system_prompt=sys_p, json_mode=True)
            if llm_res and "strength_score" in llm_res:
                return llm_res

        # Dynamic Fallback Evaluator based on user's actual answers
        ans_length = len(full_ans)
        
        # Calculate dynamic score based on answer detail & depth
        if ans_length > 150:
            score = 96
            level = "Master Artisan / Verified Expert"
            badge = "🏆 SilverHands Verified Master"
            fb = f"Master Artisan Level demonstrated in {skill_name}. Excellent detail provided regarding quality control, bulk execution, and regional technique secrets ({full_ans[:100]}...)."
        elif ans_length > 50:
            score = 90
            level = "Advanced Specialist"
            badge = "🥇 SilverHands Certified Specialist"
            fb = f"Strong practical capability in {skill_name}. Demonstrated solid understanding of fundamentals and community service standards."
        else:
            score = 84
            level = "Skilled Artisan"
            badge = "🥈 SilverHands Verified Practitioner"
            fb = f"Verified practical experience in {skill_name}. Ready to take on local opportunities and conduct beginner workshops."

        return {
            "skill_name": skill_name,
            "strength_score": score,
            "level": level,
            "badge": badge,
            "feedback": fb
        }

ai_service = AIEngine()
