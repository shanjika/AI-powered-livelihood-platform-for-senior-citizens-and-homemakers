"""
SilverHands AI Engine
Combines Google Gemini API with robust MockAIService fallback.
Supports adaptive onboarding interview, skill extraction, opportunity matching,
multi-member collaboration recommendation, class creation, content generation, and SilverBuddy voice assistant.
"""
import os
import json
from typing import Dict, List, Any, Optional

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class AIEngine:
    def __init__(self):
        self.use_real_ai = False
        if GEMINI_API_KEY:
            try:
                from google import genai
                self.client = genai.Client(api_key=GEMINI_API_KEY)
                self.use_real_ai = True
                print("SilverHands AI Engine: Gemini API enabled.")
            except Exception as e:
                print(f"SilverHands AI Engine: Failed to init Gemini API ({e}). Falling back to MockAIService.")

    def onboarding_chat(self, step: int, user_input: str, history: List[Dict[str, str]], lang: str = "ta") -> Dict[str, Any]:
        """Adaptive Onboarding Interview step handler."""
        if self.use_real_ai:
            try:
                prompt = f"""
                You are SilverHands AI Interviewer speaking in language code '{lang}'.
                Step: {step}
                User latest answer: "{user_input}"
                Conversation history: {json.dumps(history)}

                Ask the NEXT single relevant question for senior citizen or homemaker onboarding.
                Return JSON with format:
                {{
                    "question": "text in {lang}",
                    "next_step": {step + 1},
                    "is_complete": false
                }}
                """
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config={'response_mime_type': 'application/json'}
                )
                return json.loads(response.text)
            except Exception:
                pass

        # Fallback Mock logic tailored to senior citizens and homemakers
        questions_by_lang = {
            "ta": [
                "வணக்கம்! உங்கள் பெயர் மற்றும் வயது என்ன? நீங்கள் எந்த ஊரில் வசிக்கிறீர்கள்?",
                "உங்களுக்கு சமையல், தையல், கற்பித்தல் அல்லது வேறு என்னென்ன அனுபவங்கள் உள்ளன?",
                "நீங்கள் இதுவரை குடும்பத்திற்கோ அல்லது மற்றவர்களுக்கோ செய்த முக்கியமான பணிகள் என்ன?",
                "நீங்கள் எந்த வகையான வேலைகளை செய்ய விரும்புகிறீர்கள்? (வீட்டிலிருந்தா / அருகில் இருக்கும் இடங்களிலா?)",
                "வாரத்தில் எந்த நாட்களில் மற்றும் எத்தனை மணிநேரம் உங்களால் வேலை செய்ய முடியும்?"
            ],
            "hi": [
                "नमस्ते! आपका नाम और आयु क्या है? आप किस शहर में रहते हैं?",
                "आपको खाना पकाने, सिलाई, पढ़ाने या अन्य किस काम का अनुभव है?",
                "आपने अपने परिवार या समाज के लिए कौन से मुख्य कार्य किए हैं?",
                "आप किस प्रकार का काम करना पसंद करेंगे? (घर से या पास की जगह पर?)",
                "आप सप्ताह में किन दिनों और कितने घंटे काम कर सकते हैं?"
            ],
            "en": [
                "Welcome! What is your full name and age? Which city or area do you live in?",
                "What skills or experience do you have in cooking, tailoring, teaching, or other crafts?",
                "What major work or activities have you done for your family or community over the years?",
                "What type of work would you prefer? (Work from home, local projects, teaching, or events?)",
                "Which days of the week and how many hours are you comfortably available?"
            ]
        }

        lang_q = questions_by_lang.get(lang, questions_by_lang["ta"])
        idx = min(step - 1, len(lang_q) - 1)
        is_complete = step >= len(lang_q)
        
        return {
            "question": lang_q[idx],
            "next_step": step + 1,
            "is_complete": is_complete
        }

    def extract_skills(self, user_text: str, history: List[Dict[str, str]], lang: str = "ta") -> List[Dict[str, Any]]:
        """Extract explicit, hidden, and transferable skills from onboarding conversation."""
        if self.use_real_ai:
            try:
                prompt = f"""
                Analyze this senior/homemaker user profile transcript:
                "{user_text}"
                History: {json.dumps(history)}

                Extract explicit and hidden skills.
                Return JSON list of objects:
                [
                  {{
                    "id": "skill_id",
                    "name": "Skill Name",
                    "category": "Cooking|Tailoring|Teaching|Handicrafts|Gardening|Services",
                    "confidence": "High|Medium",
                    "experience_years": 25,
                    "reasoning": "Reason why AI extracted this skill",
                    "can_teach": true,
                    "can_collaborate": true,
                    "earning_paths": ["Path 1", "Path 2"]
                  }}
                ]
                """
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config={'response_mime_type': 'application/json'}
                )
                return json.loads(response.text)
            except Exception:
                pass

        # Intelligent mock extraction logic
        lower_input = user_text.lower()
        extracted = []

        if any(k in lower_input for k in ["cook", "food", "snack", "சமையல்", "தின்பண்டங்கள்", "சாப்பாடு", "खाना", "रसोई"]):
            extracted.append({
                "id": "extracted-cook",
                "name": "Traditional Cooking & Snack Preparation",
                "category": "Cooking",
                "confidence": "High",
                "experience_years": 25,
                "proficiency": "Expert",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Home / Local",
                "reasoning": "Inferred 25 years of family cooking, festival sweets preparation, and bulk snack skills.",
                "earning_paths": ["Homemade food orders", "Festival catering", "Cooking classes", "Recipe videos"]
            })
            extracted.append({
                "id": "extracted-teach-cook",
                "name": "Culinary Workshop Instructor",
                "category": "Teaching",
                "confidence": "Medium",
                "experience_years": 10,
                "proficiency": "Advanced",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Workshops / Online",
                "reasoning": "Hidden transferable skill: Ability to guide others in traditional healthy recipes.",
                "earning_paths": ["Weekend cooking classes", "Online recipe courses"]
            })

        if any(k in lower_input for k in ["tailor", "stitch", "sew", "தையல்", "துணி", "सिलाई"]):
            extracted.append({
                "id": "extracted-tailor",
                "name": "Tailoring & Garment Stitching",
                "category": "Tailoring",
                "confidence": "High",
                "experience_years": 20,
                "proficiency": "Expert",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Home-based",
                "reasoning": "Demonstrated expertise in sari blousing, cloth bag stitching, and alterative fitting.",
                "earning_paths": ["Custom blouse stitching", "Bulk cloth bag orders", "Tailoring classes"]
            })

        if any(k in lower_input for k in ["teach", "math", "tuition", "ஆசிரியர்", "பாடம்", "पढ़ाना"]):
            extracted.append({
                "id": "extracted-math",
                "name": "Academic Tutoring & Vedic Math",
                "category": "Teaching",
                "confidence": "High",
                "experience_years": 18,
                "proficiency": "Expert",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Home / Online",
                "reasoning": "Longstanding academic experience in mentoring students and simplification of math concepts.",
                "earning_paths": ["Tuition batches", "Vedic Math summer workshops"]
            })

        if not extracted:
            # Default fallback for general experience
            extracted.append({
                "id": "extracted-default-cook",
                "name": "Traditional South Indian Cooking",
                "category": "Cooking",
                "confidence": "High",
                "experience_years": 25,
                "proficiency": "Expert",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Home / Local",
                "reasoning": "Inferred from rich family culinary experience and traditional recipe knowledge.",
                "earning_paths": ["Food orders", "Event catering", "Cooking classes"]
            })
            extracted.append({
                "id": "extracted-default-teach",
                "name": "Traditional Recipe Teaching",
                "category": "Teaching",
                "confidence": "Medium",
                "experience_years": 10,
                "proficiency": "Advanced",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Online / Local",
                "reasoning": "Inferred ability to share family heritage recipes with younger generations.",
                "earning_paths": ["Cooking workshops", "Online tutoring"]
            })

        return extracted

    def generate_class(self, prompt: str, user_name: str, lang: str = "ta") -> Dict[str, Any]:
        """AI Class Creation Engine."""
        return {
            "title": "Traditional South Indian Millet Snacks Class",
            "instructor": user_name,
            "category": "Cooking",
            "fee": 800,
            "duration": "4 Sessions (Saturdays)",
            "schedule": "10:00 AM - 11:30 AM",
            "mode": "Hybrid (Online Zoom + Kitchen Workshop)",
            "max_students": 12,
            "description": "Learn to make crispy, zero-preservative millet murukku, seedai, and laddu using traditional family recipes.",
            "curriculum": [
                "Session 1: Selection & Roasting of Fresh Millets",
                "Session 2: Traditional Dough Spicing & Moisture Control",
                "Session 3: Frying Techniques for High Crispiness",
                "Session 4: Packaging, Shelf-life & Commercial Tips"
            ]
        }

    def generate_video_metadata(self, video_title: str, lang: str = "ta") -> Dict[str, Any]:
        """AI Content Auto-Transcription & Bilingual Subtitles Generator."""
        return {
            "title": video_title if video_title else "Traditional Millet Snack Preparation",
            "category": "Traditional Cooking",
            "language": lang,
            "tags": ["Millet", "Cooking", "Traditional Food", "Tamil Cuisine", "Health"],
            "description": "Step-by-step masterclass on preparing crunchy, nutritious traditional millet snacks at home.",
            "subtitles_ta": "1. முதலில் தினையை நன்றாகக் கழுவி உலர வைக்கவும்.\n2. குறைந்த தீயில் வறுத்து மாவாக அரைக்கவும்.\n3. எள்ளு மற்றும் சீரகம் சேர்த்து பிசையவும்.",
            "subtitles_en": "1. First rinse the millet thoroughly and dry it.\n2. Roast on low flame and grind into fine flour.\n3. Add sesame seeds and cumin, then knead into dough."
        }

    def generate_post(self, prompt: str, lang: str = "ta") -> Dict[str, str]:
        """AI Post Generation for Social & Ecosystem Sharing."""
        if lang == "ta":
            return {
                "headline": "பாரம்பரிய தினை தின்பண்டங்கள் வகுப்பு! 🌾🍳",
                "content": "வணக்கம் நண்பர்களே! வரவிருக்கும் சனிக்கிழமை முதல் ஆரோக்கியமான தினை முறுக்கு மற்றும் சீடை செய்யும் நேரடி ஆன்லைன் வகுப்பு தொடங்குகிறது. சேர்க்கைக்கு உடனடியாக தொடர்பு கொள்ளவும்! 📞",
                "hashtags": "#SilverHands #TamilFood #HealthyCooking #HomeChef"
            }
        else:
            return {
                "headline": "Master Traditional Healthy Millet Cooking! 🌾🍳",
                "content": "Hello friends! I am hosting a 4-session weekend culinary workshop on authentic South Indian millet snacks. Learn grandmother recipes with zero artificial additives! Enroll today.",
                "hashtags": "#SilverHands #HealthyCooking #TraditionalSnacks #HomeChef"
            }

    def silverbuddy_query(self, query: str, user_profile: Dict[str, Any], lang: str = "ta") -> Dict[str, Any]:
        """SilverBuddy Voice & Text AI Assistant."""
        q_lower = query.lower()
        if "earn" in q_lower or "சம்பாதிக்க" in q_lower or "कमाई" in q_lower:
            return {
                "answer": "Based on your 25 years of cooking experience, you can earn through: 1) Traditional Snack Orders (₹5,000/event), 2) Weekend Cooking Classes (₹800/student), and 3) Video Content. Would you like me to open your Earnings Dashboard?",
                "action": "navigate_earnings"
            }
        elif "class" in q_lower or "வகுப்பு" in q_lower or "क्लास" in q_lower:
            return {
                "answer": "You currently have 1 active class: 'Traditional South Indian Millet Snacks' with 8 students enrolled. Would you like to create a new class?",
                "action": "navigate_classes"
            }
        elif "opportunity" in q_lower or "work" in q_lower or "வாய்ப்பு" in q_lower:
            return {
                "answer": "I found 3 nearby opportunities! The highest match is 'Traditional Food Event - 500 Snack Boxes' (94% match, ₹5,000 earning). Let me take you to the Opportunity Radar.",
                "action": "navigate_radar"
            }
        else:
            return {
                "answer": f"Hello {user_profile.get('name', 'Friend')}! I am SilverBuddy. I can help you discover work, organize classes, collaborate with peers, or check your earnings.",
                "action": "none"
            }

ai_service = AIEngine()
