"""
SilverHands FastAPI Application Server
Provides RESTful API endpoints for Email Authentication (Sign Up / Login),
Multilingual Onboarding with Essential Detail Extraction (District, Taluk, State, Education),
Skill Strength Assessment Analyzer, Opportunity Radar, Collaborations, and Content Studio.
"""
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import os
import json

try:
    from .database import get_db, init_db, haversine_distance
    from .ai_engine import ai_service
    from .opportunity_matcher import calculate_match_score, recommend_collaboration_team
except ImportError:  # pragma: no cover - fallback when started directly
    from database import get_db, init_db, haversine_distance
    from ai_engine import ai_service
    from opportunity_matcher import calculate_match_score, recommend_collaboration_team

app = FastAPI(
    title="SilverHands API Ecosystem",
    description="Your Experience. Your Skills. Your Opportunity.",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def disable_cache_middleware(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Models
class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = "password123"

class SignUpRequest(BaseModel):
    email: str
    name: str
    age: Optional[int] = None
    phone: str
    password: Optional[str] = "password123"
    district: Optional[str] = "Chennai"
    taluk: Optional[str] = "Mylapore"
    state: Optional[str] = "Tamil Nadu"
    education: Optional[str] = "Higher Secondary School"
    language: Optional[str] = "ta"

class EssentialDetailsRequest(BaseModel):
    user_id: str
    name: str
    age: Optional[int] = None
    phone: str
    district: str
    taluk: str
    state: str
    education: Optional[str] = ""

class StrengthAssessRequest(BaseModel):
    user_id: str
    skill_name: str
    answers: List[str]
    lang: str = "ta"

class ChatRequest(BaseModel):
    step: int = 1
    user_input: str = ""
    history: List[Dict[str, str]] = []
    lang: str = "ta"

class SkillExtractRequest(BaseModel):
    user_text: str
    history: List[Dict[str, str]] = []
    lang: str = "ta"
    user_id: Optional[str] = None

class SkillSaveRequest(BaseModel):
    user_id: str
    skills: List[Dict[str, Any]]

class ClassCreateRequest(BaseModel):
    prompt: str
    user_name: str = "Lakshmi Ammal"
    lang: str = "ta"
    user_skills: List[str] = []

class VideoUploadRequest(BaseModel):
    title: str
    category: str = "Traditional Cooking"
    author: str = "Lakshmi Ammal"
    lang: str = "ta"

class PostGenerateRequest(BaseModel):
    prompt: str
    lang: str = "ta"

class SilverBuddyRequest(BaseModel):
    query: str
    user_id: str = "u-lakshmi-64"
    lang: str = "ta"

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "SilverHands", "ai_mode": "Gemini" if ai_service.use_real_ai else "MockAIService"}

# Authentication Endpoints
@app.post("/api/auth/login")
def login(req: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (req.email,))
    user = cursor.fetchone()
    
    if not user:
        # Auto register new user by email ID
        user_id = f"u-{os.urandom(4).hex()}"
        name_part = req.email.split("@")[0].capitalize()
        new_user = {
            "id": user_id,
            "email": req.email,
            "password": req.password,
            "name": name_part,
            "age": None,
            "gender": "",
            "role": "",
            "phone": "",
            "district": "",
            "taluk": "",
            "state": "",
            "education": "",
            "language": "ta",
            "location_name": "",
            "latitude": None,
            "longitude": None,
            "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
            "trust_score": 0,
            "skill_strength_score": 0,
            "identity_verified": 0,
            "rating": 0,
            "reviews_count": 0,
            "completed_jobs": 0,
            "bio": ""
        }
        cursor.execute("""
        INSERT INTO users (id, email, password, name, age, gender, role, phone, district, taluk, state, education, language, location_name, latitude, longitude, avatar_url, trust_score, skill_strength_score, identity_verified, rating, reviews_count, completed_jobs, bio)
        VALUES (:id, :email, :password, :name, :age, :gender, :role, :phone, :district, :taluk, :state, :education, :language, :location_name, :latitude, :longitude, :avatar_url, :trust_score, :skill_strength_score, :identity_verified, :rating, :reviews_count, :completed_jobs, :bio)
        """, new_user)
        conn.commit()
        user = new_user

    cursor.execute("SELECT * FROM user_skills WHERE user_id = ?", (user["id"],))
    user["skills"] = cursor.fetchall()
    conn.close()
    return {"status": "success", "user": user}

@app.post("/api/auth/signup")
def signup(req: SignUpRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (req.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered. Please login.")

    user_id = f"u-{os.urandom(4).hex()}"
    location = f"{req.taluk}, {req.district}"
    new_user = {
        "id": user_id,
        "email": req.email,
        "password": req.password,
        "name": req.name,
        "age": req.age,
        "gender": "",
        "role": "",
        "phone": req.phone or "",
        "district": req.district or "",
        "taluk": req.taluk or "",
        "state": req.state or "",
        "education": req.education or "",
        "language": req.language,
        "location_name": location if location and location.strip() else "",
        "latitude": None,
        "longitude": None,
        "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
        "trust_score": 0,
        "skill_strength_score": 0,
        "identity_verified": 0,
        "rating": 0,
        "reviews_count": 0,
        "completed_jobs": 0,
        "bio": ""
    }
    cursor.execute("""
    INSERT INTO users (id, email, password, name, age, gender, role, phone, district, taluk, state, education, language, location_name, latitude, longitude, avatar_url, trust_score, skill_strength_score, identity_verified, rating, reviews_count, completed_jobs, bio)
    VALUES (:id, :email, :password, :name, :age, :gender, :role, :phone, :district, :taluk, :state, :education, :language, :location_name, :latitude, :longitude, :avatar_url, :trust_score, :skill_strength_score, :identity_verified, :rating, :reviews_count, :completed_jobs, :bio)
    """, new_user)
    conn.commit()
    new_user["skills"] = []
    conn.close()
    return {"status": "success", "user": new_user}

@app.post("/api/users/update_essential")
def update_essential_details(req: EssentialDetailsRequest):
    conn = get_db()
    cursor = conn.cursor()
    location = f"{req.taluk}, {req.district}, {req.state}"
    cursor.execute("""
    UPDATE users 
    SET name = ?, age = ?, phone = ?, district = ?, taluk = ?, state = ?, education = ?, location_name = ?
    WHERE id = ?
    """, (req.name, req.age, req.phone, req.district, req.taluk, req.state, req.education, location, req.user_id))
    conn.commit()
    conn.close()
    return {"status": "updated", "location": location}

@app.post("/api/skills/assess")
def assess_skill_strength(req: StrengthAssessRequest):
    """Generates strength analysis score & feedback based on user skill assessment questions."""
    eval_res = ai_service.assess_skill_strength(req.user_id, req.skill_name, req.answers, req.lang)
    strength_score = eval_res.get("strength_score", 92)
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET skill_strength_score = ? WHERE id = ?", (strength_score, req.user_id))
    conn.commit()
    conn.close()

    return eval_res

# User & Skill Endpoints
@app.get("/api/users/{user_id}")
def get_user(user_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ? OR email = ?", (user_id, user_id))
    user = cursor.fetchone()
    if not user:
        cursor.execute("SELECT * FROM users WHERE id = 'u-lakshmi-64'")
        user = cursor.fetchone()
    
    cursor.execute("SELECT * FROM user_skills WHERE user_id = ?", (user["id"],))
    user["skills"] = cursor.fetchall()
    conn.close()
    return user

@app.post("/api/onboard/chat")
def onboard_chat(req: ChatRequest):
    return ai_service.onboarding_chat(req.step, req.user_input, req.history, req.lang)

@app.post("/api/skills/extract")
def extract_skills(req: SkillExtractRequest):
    extracted = ai_service.extract_skills(req.user_text, req.history, req.lang)
    if req.user_id:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_skills WHERE user_id = ?", (req.user_id,))
        for s in extracted:
            sid = s.get("id") or f"s-{os.urandom(3).hex()}"
            cursor.execute("""
            INSERT OR REPLACE INTO user_skills (id, user_id, name, category, confidence, experience_years, proficiency, can_teach, can_collaborate, preferred_work, specializations, reasoning, earning_paths, confirmed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                sid, req.user_id, s.get("name"), s.get("category", "Services"),
                s.get("confidence", "High"), s.get("experience_years", 15),
                s.get("proficiency", "Expert"), 1 if s.get("can_teach") else 0,
                1 if s.get("can_collaborate") else 0, s.get("preferred_work", "Local"),
                json.dumps(s.get("specializations", [])), s.get("reasoning", ""),
                json.dumps(s.get("earning_paths", [])), 1
            ))
        conn.commit()
        conn.close()
    return extracted

@app.post("/api/skills/save")
def save_skills(req: SkillSaveRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_skills WHERE user_id = ?", (req.user_id,))
    for s in req.skills:
        sid = s.get("id") or f"s-{os.urandom(3).hex()}"
        cursor.execute("""
        INSERT INTO user_skills (id, user_id, name, category, confidence, experience_years, proficiency, can_teach, can_collaborate, preferred_work, specializations, reasoning, earning_paths, confirmed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sid, req.user_id, s.get("name"), s.get("category", "Services"),
            s.get("confidence", "High"), s.get("experience_years", 10),
            s.get("proficiency", "Expert"), 1 if s.get("can_teach") else 0,
            1 if s.get("can_collaborate") else 0, s.get("preferred_work", "Local"),
            json.dumps(s.get("specializations", [])), s.get("reasoning", ""),
            json.dumps(s.get("earning_paths", [])), 1
        ))
    conn.commit()
    conn.close()
    return {"status": "success", "saved": len(req.skills)}

# Opportunities & Radar
@app.get("/api/opportunities")
def get_opportunities(category: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    if category and category != "All":
        cursor.execute("SELECT * FROM opportunities WHERE category = ?", (category,))
    else:
        cursor.execute("SELECT * FROM opportunities")
    opps = cursor.fetchall()
    conn.close()
    return opps

@app.get("/api/opportunities/match/{user_id}")
def match_opportunities(user_id: str):
    user = get_user(user_id)
    skills = user.get("skills") or []
    if not skills:
        return []

    # Use ONLY primary skill (highest experience)
    primary_skill = max(skills, key=lambda s: int(s.get("experience_years", 0) or 0)) if skills else None
    if not primary_skill:
        return []
    
    skill_name = primary_skill.get("name") or ""
    user_name = user.get("name", "Community Member")
    location = user.get("location_name") or user.get("district") or "Chennai"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM opportunities")
    opps = cursor.fetchall()
    conn.close()

    matched = []
    for opp in opps:
        # Filter STRICTLY to primary skill only
        opp_category = str(opp.get("category") or "").lower()
        opp_title = str(opp.get("title") or "").lower()
        skill_lower = skill_name.lower()
        
        if skill_lower not in opp_category and skill_lower not in opp_title:
            continue
        
        score = calculate_match_score(user, opp)
        if score > 0:
            opp["match_score"] = score
            u_lat = user.get("latitude") or 13.0339
            u_lon = user.get("longitude") or 80.2696
            o_lat = opp.get("latitude") or 13.0320
            o_lon = opp.get("longitude") or 80.2710
            opp["distance_km"] = haversine_distance(u_lat, u_lon, o_lat, o_lon)
            matched.append(opp)

    # Generate AI-tailored opportunities ONLY for primary skill
    if not matched and skill_name:
        matched = ai_service.generate_skill_opportunities(user_name, skill_name, location)

    matched.sort(key=lambda x: x.get("match_score", 0), reverse=True)
    return matched

# Collaboration Engine
@app.get("/api/collaborations")
def get_collaborations(user_id: Optional[str] = Query(None)):
    if user_id:
        user = get_user(user_id)
        skills = user.get("skills") or []
        if not skills:
            return []
        
        # Use ONLY primary skill (highest experience)
        primary_skill = max(skills, key=lambda s: int(s.get("experience_years", 0) or 0))
        if primary_skill and primary_skill.get("name"):
            skill_name = primary_skill.get("name")
            user_name = user.get("name", "Community Member")
            location = user.get("location_name") or user.get("district") or "Chennai"
            # Return only the first collaboration (primary skill only)
            collabs = ai_service.generate_skill_collaborations(user_name, skill_name, location)
            return collabs[:1] if collabs else []

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM collaborations")
    collabs = cursor.fetchall()
    conn.close()
    return collabs

@app.post("/api/collaborations/recommend")
def recommend_collaboration(opportunity_id: str = Body(..., embed=True)):
    return recommend_collaboration_team(opportunity_id)

# Classes & Booking
@app.get("/api/classes")
def get_classes(user_id: Optional[str] = Query(None)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM classes")
    cls = cursor.fetchall()
    conn.close()

    if user_id:
        user = get_user(user_id)
        skills = user.get("skills") or []
        if not skills:
            return []
        
        # Use ONLY primary skill (highest experience)
        primary_skill = max(skills, key=lambda s: int(s.get("experience_years", 0) or 0))
        skill_name = str(primary_skill.get("name") or "").strip().lower()
        if not skill_name:
            return []

        filtered = []
        for c in cls:
            title = str(c.get("title") or "").lower()
            category = str(c.get("category") or "").lower()
            if skill_name in title or skill_name in category:
                filtered.append(c)
        if filtered:
            return filtered

        # Generate only for primary skill
        generated_class = ai_service.generate_class(f"I want to teach a beginner-friendly {primary_skill.get('name')} class.", user.get("name", "User"), user.get("language", "ta"), [primary_skill.get("name")])
        generated_class["id"] = f"skill-class-{os.urandom(3).hex()}"
        generated_class["enrolled_count"] = 0
        generated_class["max_students"] = 12
        return [generated_class]

    return cls

@app.post("/api/classes/create")
def create_class(req: ClassCreateRequest):
    generated = ai_service.generate_class(req.prompt, req.user_name, req.lang, req.user_skills)
    conn = get_db()
    cursor = conn.cursor()
    cls_id = f"cls-{os.urandom(4).hex()}"
    generated["id"] = cls_id
    generated_copy = dict(generated)
    generated_copy["curriculum"] = json.dumps(generated_copy.get("curriculum", []))
    cursor.execute("""
    INSERT INTO classes (id, title, instructor, category, fee, duration, schedule, mode, enrolled_count, max_students, description, curriculum)
    VALUES (:id, :title, :instructor, :category, :fee, :duration, :schedule, :mode, 1, :max_students, :description, :curriculum)
    """, generated_copy)
    conn.commit()
    conn.close()
    return generated

# Video & Content Studio
@app.get("/api/videos")
def get_videos(user_id: Optional[str] = Query(None)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM videos")
    vids = cursor.fetchall()
    conn.close()

    if user_id:
        user = get_user(user_id)
        skills = user.get("skills") or []
        if not skills:
            return []
        
        # Use ONLY primary skill (highest experience)
        primary_skill = max(skills, key=lambda s: int(s.get("experience_years", 0) or 0))
        skill_name = str(primary_skill.get("name") or "").strip().lower()
        if not skill_name:
            return []

        filtered = []
        for v in vids:
            title = str(v.get("title") or "").lower()
            category = str(v.get("category") or "").lower()
            if skill_name in title or skill_name in category:
                filtered.append(v)
        if filtered:
            return filtered

        # Generate only for primary skill
        meta = ai_service.generate_video_metadata(primary_skill.get("name"), user.get("language", "ta"))
        return [{
            "id": f"skill-video-{os.urandom(3).hex()}",
            "title": meta.get("title") or f"{primary_skill.get('name')} tutorial",
            "author": user.get("name", "User"),
            "category": meta.get("category") or primary_skill.get("name"),
            "language": user.get("language", "ta"),
            "views": 124,
            "watch_time_hours": 8,
            "followers": 320,
            "estimated_earning": 180,
            "thumbnail": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "tags": json.dumps(meta.get("tags", [])),
            "subtitles_ta": meta.get("subtitles_ta", ""),
            "subtitles_en": meta.get("subtitles_en", "")
        }]

    return vids

@app.post("/api/videos/upload")
def upload_video(req: VideoUploadRequest):
    meta = ai_service.generate_video_metadata(req.title, req.lang)
    conn = get_db()
    cursor = conn.cursor()
    vid_id = f"vid-{os.urandom(4).hex()}"
    new_vid = {
        "id": vid_id,
        "title": meta["title"],
        "author": req.author,
        "category": meta["category"],
        "language": req.lang,
        "views": 1,
        "watch_time_hours": 1,
        "followers": 850,
        "estimated_earning": 150,
        "thumbnail": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "tags": json.dumps(meta["tags"]),
        "subtitles_ta": meta["subtitles_ta"],
        "subtitles_en": meta["subtitles_en"]
    }
    cursor.execute("""
    INSERT INTO videos (id, title, author, category, language, views, watch_time_hours, followers, estimated_earning, thumbnail, video_url, tags, subtitles_ta, subtitles_en)
    VALUES (:id, :title, :author, :category, :language, :views, :watch_time_hours, :followers, :estimated_earning, :thumbnail, :video_url, :tags, :subtitles_ta, :subtitles_en)
    """, new_vid)
    conn.commit()
    conn.close()
    return new_vid

@app.post("/api/posts/generate")
def generate_post(req: PostGenerateRequest):
    return ai_service.generate_post(req.prompt, req.lang)

# Earnings & Income Recommendation
@app.get("/api/earnings/{user_id}")
def get_earnings(user_id: str):
    user = get_user(user_id)
    skills = user.get("skills") or []
    if not skills:
        return {"current_month": 0, "completed": 0, "pending": 0, "breakdown": [], "ways_to_earn": [], "skill_name": "General"}

    # Use ONLY primary skill (highest experience)
    primary_skill = max(skills, key=lambda s: int(s.get("experience_years", 0) or 0))
    name = str(primary_skill.get("name") or "Skill").strip()
    if not name:
        return {"current_month": 0, "completed": 0, "pending": 0, "breakdown": [], "ways_to_earn": [], "skill_name": "General"}
    
    amount = max(1200, int((primary_skill.get("experience_years") or 5) * 160))
    breakdown = [{
        "source": name,
        "amount": amount,
        "percentage": 100,
        "icon": "✨"
    }]

    ways_to_earn = [
        {
            "title": f"1. Custom {name} Client Orders",
            "potential": "₹4,000 – ₹10,000 / month",
            "desc": f"Take direct bespoke {name.lower()} orders and customized client requests."
        },
        {
            "title": f"2. Weekend {name} Workshops & Classes",
            "potential": "₹3,000 – ₹7,000 / month",
            "desc": f"Host small interactive workshops teaching fundamental {name.lower()} techniques."
        },
        {
            "title": f"3. Community Project & Exhibition Collaborations",
            "potential": "₹5,000 – ₹15,000 / event",
            "desc": f"Join neighborhood collective orders and showcase your {name.lower()} creations."
        }
    ]

    return {
        "current_month": amount,
        "completed": max(0, int(amount * 0.7)),
        "pending": max(0, int(amount * 0.3)),
        "breakdown": breakdown,
        "skill_name": name,
        "ways_to_earn": ways_to_earn
    }

# SilverBuddy Assistant
@app.post("/api/silverbuddy/query")
def silverbuddy(req: SilverBuddyRequest):
    user = get_user(req.user_id)
    return ai_service.silverbuddy_query(req.query, user, req.lang)

# Admin Dashboard Stats
@app.get("/api/admin/stats")
def get_admin_stats():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as users_count FROM users")
    users_cnt = cursor.fetchone()["users_count"]
    cursor.execute("SELECT COUNT(*) as opps_count FROM opportunities")
    opps_cnt = cursor.fetchone()["opps_count"]
    cursor.execute("SELECT COUNT(*) as collabs_count FROM collaborations")
    collabs_cnt = cursor.fetchone()["collabs_count"]
    cursor.execute("SELECT COUNT(*) as classes_count FROM classes")
    classes_cnt = cursor.fetchone()["classes_count"]
    cursor.execute("SELECT COUNT(*) as videos_count FROM videos")
    videos_cnt = cursor.fetchone()["videos_count"]
    conn.close()

    return {
        "total_users": users_cnt + 24,
        "senior_citizens": 18,
        "homemakers": 11,
        "active_skills": 42,
        "active_opportunities": opps_cnt,
        "collaborations_active": collabs_cnt + 3,
        "classes_published": classes_cnt + 5,
        "videos_uploaded": videos_cnt + 12,
        "total_income_generated_inr": 184500,
        "top_skills": [
            {"skill": "Traditional Cooking", "count": 14},
            {"skill": "Tailoring & Embroidery", "count": 11},
            {"skill": "Academic & Vedic Tutoring", "count": 9},
            {"skill": "Handicrafts & Art", "count": 8}
        ]
    }

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
