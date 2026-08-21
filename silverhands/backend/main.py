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
    from .opportunity_matcher import calculate_match_score, recommend_collaboration_team, is_skill_domain_match
except ImportError:  # pragma: no cover - fallback when started directly
    from database import get_db, init_db, haversine_distance
    from ai_engine import ai_service
    from opportunity_matcher import calculate_match_score, recommend_collaboration_team, is_skill_domain_match

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

class OpportunityCreateRequest(BaseModel):
    title: str
    category: str
    company: str
    location_name: str
    experience: str
    expected_earning: int
    time: str
    contact: str
    description: str

class VideoUploadRequest(BaseModel):
    title: str
    category: str = "Traditional Cooking"
    author: str = "Lakshmi Ammal"
    lang: str = "ta"

class PostGenerateRequest(BaseModel):
    prompt: str
    lang: str = "ta"

class VideoGenerateSkillRequest(BaseModel):
    user_id: str
    skill_name: str
    category: Optional[str] = ""
    lang: Optional[str] = "ta"

class ImageGenerateRequest(BaseModel):
    skill_name: str
    topic: Optional[str] = ""
    category: Optional[str] = ""

class CollabRecommendRequest(BaseModel):
    opportunity_id: Optional[str] = None
    user_id: Optional[str] = None
    skill_name: Optional[str] = None
    target_capacity: Optional[int] = 3

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
@app.post("/api/opportunities/create")
def create_opportunity(req: OpportunityCreateRequest):
    conn = get_db()
    cursor = conn.cursor()
    
    opp_id = f"opp-{os.urandom(4).hex()}"
    description = f"{req.description}\n\nCompany: {req.company}\nExperience: {req.experience}\nContact: {req.contact}"
    
    new_opp = {
        "id": opp_id,
        "title": req.title,
        "category": req.category,
        "location_name": req.location_name,
        "latitude": 13.0, # Default or could be geocoded
        "longitude": 80.2,
        "distance_km": 0.0,
        "date": "Ongoing",
        "time": req.time,
        "expected_earning": req.expected_earning,
        "individual_earning": req.expected_earning,
        "work_type": "Full-time",
        "match_score": 0,
        "required_skills": "",
        "description": description,
        "collaborative_project": 0,
        "target_team_size": 1
    }
    
    cursor.execute("""
    INSERT INTO opportunities (id, title, category, location_name, latitude, longitude, distance_km, date, time, expected_earning, individual_earning, work_type, match_score, required_skills, description, collaborative_project, target_team_size)
    VALUES (:id, :title, :category, :location_name, :latitude, :longitude, :distance_km, :date, :time, :expected_earning, :individual_earning, :work_type, :match_score, :required_skills, :description, :collaborative_project, :target_team_size)
    """, new_opp)
    
    conn.commit()
    conn.close()
    
    return {"status": "success", "opportunity": new_opp}

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
        if user:
            skills = user.get("skills") or []
            if not skills:
                return []
            
            # Primary skill
            primary_skill = max(skills, key=lambda s: int(s.get("experience_years", 0) or 0))
            skill_name = primary_skill.get("name", "")
            skill_cat = primary_skill.get("category", "")
            user_name = user.get("name", "Community Member")
            location = user.get("location_name") or user.get("district") or "Chennai"

            # Check DB for matching collaborations
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM collaborations")
            db_collabs = cursor.fetchall()
            conn.close()

            matched_collabs = []
            for col in db_collabs:
                c_dict = dict(col)
                if isinstance(c_dict.get("members"), str):
                    try:
                        c_dict["members"] = json.loads(c_dict["members"])
                    except Exception:
                        c_dict["members"] = []
                
                comb_text = f"{c_dict.get('project_name', '')} {c_dict.get('opportunity_id', '')} " + " ".join([m.get("role", "") for m in c_dict.get("members", [])])
                if is_skill_domain_match(comb_text, skill_name, skill_cat):
                    members = c_dict.get("members", [])
                    if members and user_name:
                        members[0]["name"] = f"{user_name} (You)" if "You" not in members[0]["name"] else members[0]["name"]
                        members[0]["user_id"] = user.get("id")
                        if user.get("avatar_url"):
                            members[0]["avatar"] = user.get("avatar_url")
                    matched_collabs.append(c_dict)

            if matched_collabs:
                return matched_collabs

            # If no matching DB collaboration, generate AI collaborations strictly for user's skill
            collabs = ai_service.generate_skill_collaborations(user_name, skill_name, location)
            return collabs if collabs else []

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM collaborations")
    raw_collabs = cursor.fetchall()
    conn.close()

    collabs = []
    for col in raw_collabs:
        c_dict = dict(col)
        if isinstance(c_dict.get("members"), str):
            try:
                c_dict["members"] = json.loads(c_dict["members"])
            except Exception:
                c_dict["members"] = []
        collabs.append(c_dict)
    return collabs

@app.post("/api/collaborations/recommend")
def recommend_collaboration(req: Optional[CollabRecommendRequest] = None, opportunity_id: Optional[str] = Body(None, embed=True)):
    opp_id = (req.opportunity_id if req else None) or opportunity_id
    user_id = req.user_id if req else None
    skill_name = req.skill_name if req else None
    target_capacity = (req.target_capacity if req else None) or 3

    user = None
    if user_id:
        user = get_user(user_id)
        if user and not skill_name:
            skills = user.get("skills") or []
            if skills:
                primary = max(skills, key=lambda s: int(s.get("experience_years", 0) or 0))
                skill_name = primary.get("name")

    return recommend_collaboration_team(
        opportunity_id=opp_id,
        target_capacity=target_capacity,
        user=user,
        skill_name=skill_name
    )

# Classes & Booking
# Classes & Booking
@app.get("/api/classes")
def get_classes(user_id: Optional[str] = Query(None)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM classes")
    cls_rows = cursor.fetchall()
    conn.close()

    classes_list = []
    for c in cls_rows:
        item = dict(c)
        if isinstance(item.get("curriculum"), str):
            try:
                item["curriculum"] = json.loads(item["curriculum"])
            except Exception:
                item["curriculum"] = []
        classes_list.append(item)

    if user_id:
        user = get_user(user_id)
        if not user:
            return []
        skills = user.get("skills") or []
        if not skills:
            return []

        filtered = []
        for c in classes_list:
            c_title = str(c.get("title") or "").lower()
            c_cat = str(c.get("category") or "").lower()
            c_desc = str(c.get("description") or "").lower()
            combined_text = f"{c_title} {c_cat} {c_desc}"

            class_matched = False
            for s in skills:
                name = str(s.get("name") or "").strip().lower()
                cat = str(s.get("category") or "").strip().lower()
                specs = [str(sp).lower() for sp in (s.get("specializations") or []) if sp]

                # Check direct substring matches
                if (name and name in combined_text) or (cat and cat in combined_text and cat not in ["teaching", "services"]):
                    class_matched = True
                    break

                # Check specialization matches
                for spec in specs:
                    if spec in combined_text:
                        class_matched = True
                        break
                if class_matched:
                    break

                # Domain keyword matching per skill
                s_text = f"{name} {cat} {' '.join(specs)}"
                if any(w in s_text for w in ["cook", "culinary", "millet", "food", "recipe", "snack"]):
                    if any(w in combined_text for w in ["cook", "cooking", "millet", "snack", "culinary", "recipe", "food"]):
                        class_matched = True
                        break
                if any(w in s_text for w in ["tailor", "garment", "blouse", "embroidery", "stitch"]):
                    if any(w in combined_text for w in ["tailor", "tailoring", "blouse", "embroidery", "stitch", "garment"]):
                        class_matched = True
                        break
                if any(w in s_text for w in ["craft", "handcraft", "handicraft", "terracotta", "jute", "art"]):
                    if any(w in combined_text for w in ["craft", "handcraft", "handicraft", "terracotta", "jute", "art"]):
                        class_matched = True
                        break
                if any(w in s_text for w in ["math", "mathematics", "vedic"]):
                    if any(w in combined_text for w in ["math", "mathematics", "vedic"]):
                        class_matched = True
                        break

            if class_matched:
                filtered.append(c)

        if filtered:
            return filtered

        # If no DB class matched user's skill, generate tailored AI masterclass and save to DB
        primary_skill = max(skills, key=lambda s: int(s.get("experience_years", 0) or 0)) if skills else {"name": "General Craft"}
        skill_name = primary_skill.get("name") or "Skill Workshop"
        generated_class = ai_service.generate_class(
            f"I want to teach a beginner-friendly {skill_name} class.",
            user.get("name", "User"),
            user.get("language", "ta"),
            [skill_name]
        )
        cls_id = f"skill-class-{os.urandom(3).hex()}"
        generated_class["id"] = cls_id
        generated_class["enrolled_count"] = 0
        generated_class["max_students"] = 12

        conn = get_db()
        cursor = conn.cursor()
        gen_copy = dict(generated_class)
        gen_copy["curriculum"] = json.dumps(gen_copy.get("curriculum", []))
        try:
            cursor.execute("""
            INSERT INTO classes (id, title, instructor, category, fee, duration, schedule, mode, enrolled_count, max_students, description, curriculum)
            VALUES (:id, :title, :instructor, :category, :fee, :duration, :schedule, :mode, :enrolled_count, :max_students, :description, :curriculum)
            """, gen_copy)
            conn.commit()
        except Exception as e:
            print("Error persisting generated class:", e)
        finally:
            conn.close()

        return [generated_class]

    return classes_list

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
def is_video_matching_user_skills(video: Dict[str, Any], skills: List[Dict[str, Any]]) -> bool:
    """Strictly checks if a video matches any confirmed skills of the user profile."""
    v_title = str(video.get("title") or "").lower()
    v_cat = str(video.get("category") or "").lower()
    v_tags = str(video.get("tags") or "").lower()
    combined_text = f"{v_title} {v_cat} {v_tags}"

    for s in skills:
        name = str(s.get("name") or "").strip().lower()
        cat = str(s.get("category") or "").strip().lower()
        specs = [str(sp).lower() for sp in (s.get("specializations") or []) if sp]

        # 1. Exact or partial skill name match
        if name and (name in combined_text or any(part in combined_text for part in name.split() if len(part) > 3)):
            return True

        # 2. Specific domain category match
        if cat and cat in combined_text and cat not in ["services", "teaching", "general", "other"]:
            return True

        # 3. Specializations match
        for spec in specs:
            if spec and spec in combined_text:
                return True

        # 4. Domain keyword match
        s_text = f"{name} {cat} {' '.join(specs)}"

        if any(w in s_text for w in ["cook", "culinary", "millet", "food", "recipe", "snack", "sweet", "pickle", "baking", "bake", "சமையல்", "தின்பண்டங்கள்"]):
            if any(w in combined_text for w in ["cook", "cooking", "millet", "snack", "sweet", "pickle", "culinary", "recipe", "food", "baking", "bake"]):
                return True

        if any(w in s_text for w in ["tailor", "garment", "blouse", "embroidery", "stitch", "sew", "sari", "saree", "dress", "தையல்", "ஆடை"]):
            if any(w in combined_text for w in ["tailor", "tailoring", "blouse", "embroidery", "stitch", "stitching", "garment", "sew", "sari", "zari"]):
                return True

        if any(w in s_text for w in ["garden", "plant", "farm", "compost", "terrace", "soil", "தோட்டம்", "செடி", "விவசாயம்"]):
            if any(w in combined_text for w in ["garden", "gardening", "plant", "farm", "compost", "terrace", "soil", "vegetable"]):
                return True

        if any(w in s_text for w in ["craft", "handcraft", "handicraft", "terracotta", "clay", "jute", "art", "pottery", "கைவினை", "களிமண்"]):
            if any(w in combined_text for w in ["craft", "handcraft", "handicraft", "terracotta", "clay", "jute", "art", "pottery", "souvenir"]):
                return True

        if any(w in s_text for w in ["math", "mathematics", "vedic", "tutor", "tuition", "science", "physics", "chemistry", "english", "படிப்பு", "பாடம்", "கற்பித்தல்"]):
            if any(w in combined_text for w in ["math", "mathematics", "vedic", "tutor", "tutoring", "calculation", "exam"]):
                return True

        if any(w in s_text for w in ["music", "sing", "vocal", "carnatic", "instrument", "veena", "violin", "dance", "பாட்டு", "இசை"]):
            if any(w in combined_text for w in ["music", "sing", "vocal", "carnatic", "raga", "song", "instrument", "swara"]):
                return True

        if any(w in s_text for w in ["repair", "plumb", "electric", "carpenter", "wood", "fix", "பழுது", "மரவேலை", "மின்னியல்"]):
            if any(w in combined_text for w in ["repair", "plumb", "electric", "carpenter", "woodworking", "appliance", "maintenance"]):
                return True

        if any(w in s_text for w in ["care", "child", "elder", "nursing", "yoga", "wellness", "health", "பராமரிப்பு", "யோகா", "மருத்துவம்"]):
            if any(w in combined_text for w in ["care", "elder", "yoga", "wellness", "health", "pranayama", "caregiving"]):
                return True

        if any(w in s_text for w in ["account", "bookkeep", "excel", "typing", "data", "translation", "கணக்கு", "விவரப் பதிவு"]):
            if any(w in combined_text for w in ["account", "bookkeeping", "excel", "typing", "data", "translation"]):
                return True

    return False

@app.get("/api/videos")
def get_videos(user_id: Optional[str] = Query(None)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM videos")
    vids = cursor.fetchall()
    conn.close()

    if user_id:
        user = get_user(user_id)
        if not user:
            return []
        skills = user.get("skills") or []
        if not skills:
            return []

        # 1. Filter existing videos strictly to matching profile skills only
        filtered = []
        for v in vids:
            if is_video_matching_user_skills(v, skills):
                v_copy = dict(v)
                v_cat = v_copy.get("category") or (skills[0].get("name") if skills else "Skill")
                if not v_copy.get("thumbnail") or "unsplash.com" in str(v_copy.get("thumbnail")):
                    v_copy["thumbnail"] = ai_service.generate_skill_image(v_cat, v_copy.get("title") or v_cat, v_cat)
                filtered.append(v_copy)

        # 2. If fewer than 2 matching videos exist, automatically use Gemini AI to generate strictly matched videos
        if len(filtered) < 2:
            needed = 2 - len(filtered)
            user_name = user.get("name", "Creator")
            user_lang = user.get("language", "ta")
            
            # Select skills to generate videos for (primary skill first, then secondary)
            sorted_skills = sorted(skills, key=lambda s: int(s.get("experience_years", 0) or 0), reverse=True)
            target_skill = sorted_skills[0] if sorted_skills else {"name": "Artisan Skill", "category": "Artisan Craft"}
            s_name = str(target_skill.get("name") or "Artisan Skill")
            s_cat = str(target_skill.get("category") or s_name)

            generated_vids = ai_service.generate_skill_videos(
                skill_name=s_name,
                skill_category=s_cat,
                user_name=user_name,
                lang=user_lang,
                count=needed
            )

            conn = get_db()
            cursor = conn.cursor()
            for gv in generated_vids:
                gv_copy = dict(gv)
                if isinstance(gv_copy.get("tags"), list):
                    gv_copy["tags"] = json.dumps(gv_copy["tags"])
                try:
                    cursor.execute("""
                    INSERT INTO videos (id, title, author, category, language, views, watch_time_hours, followers, estimated_earning, thumbnail, video_url, tags, subtitles_ta, subtitles_en)
                    VALUES (:id, :title, :author, :category, :language, :views, :watch_time_hours, :followers, :estimated_earning, :thumbnail, :video_url, :tags, :subtitles_ta, :subtitles_en)
                    """, gv_copy)
                    filtered.append(gv)
                except Exception as e:
                    print("Error persisting Gemini AI video:", e)
                    filtered.append(gv)
            conn.commit()
            conn.close()

        # Format output videos
        for v in filtered:
            if isinstance(v.get("tags"), str):
                try:
                    v["tags"] = json.loads(v["tags"])
                except Exception:
                    v["tags"] = [v["tags"]]

        return filtered

    result_vids = []
    for v in vids:
        v_copy = dict(v)
        v_cat = v.get("category") or v.get("title") or "Artisan Skills"
        if not v_copy.get("thumbnail") or "unsplash.com" in str(v_copy.get("thumbnail")):
            v_copy["thumbnail"] = ai_service.generate_skill_image(v_cat, v.get("title"), v_cat)
        if isinstance(v_copy.get("tags"), str):
            try:
                v_copy["tags"] = json.loads(v_copy["tags"])
            except Exception:
                v_copy["tags"] = [v_copy["tags"]]
        result_vids.append(v_copy)
    return result_vids

@app.post("/api/videos/generate_for_skill")
def generate_videos_for_skill(req: VideoGenerateSkillRequest):
    """Automatically generates additional Gemini AI skill videos tailored strictly to the user's specific skill."""
    user = get_user(req.user_id)
    user_name = user.get("name", "Creator") if user else "Creator"
    lang = req.lang or (user.get("language", "ta") if user else "ta")
    generated = ai_service.generate_skill_videos(req.skill_name, req.category or req.skill_name, user_name, lang, count=2)
    conn = get_db()
    cursor = conn.cursor()
    saved = []
    for vid in generated:
        vid_copy = dict(vid)
        vid_copy["tags"] = json.dumps(vid_copy.get("tags", [])) if isinstance(vid_copy.get("tags"), list) else str(vid_copy.get("tags", "[]"))
        try:
            cursor.execute("""
            INSERT INTO videos (id, title, author, category, language, views, watch_time_hours, followers, estimated_earning, thumbnail, video_url, tags, subtitles_ta, subtitles_en)
            VALUES (:id, :title, :author, :category, :language, :views, :watch_time_hours, :followers, :estimated_earning, :thumbnail, :video_url, :tags, :subtitles_ta, :subtitles_en)
            """, vid_copy)
            saved.append(vid)
        except Exception as e:
            print("Error inserting auto-generated skill video:", e)
            saved.append(vid)
    conn.commit()
    conn.close()
    return saved

@app.post("/api/videos/upload")
def upload_video(req: VideoUploadRequest):
    meta = ai_service.generate_video_metadata(req.title, req.lang)
    conn = get_db()
    cursor = conn.cursor()
    vid_id = f"vid-{os.urandom(4).hex()}"
    cat = meta.get("category") or req.category
    dynamic_img = ai_service.generate_skill_image(cat, req.title, cat)
    new_vid = {
        "id": vid_id,
        "title": meta["title"],
        "author": req.author,
        "category": cat,
        "language": req.lang,
        "views": 1,
        "watch_time_hours": 1,
        "followers": 850,
        "estimated_earning": 150,
        "thumbnail": dynamic_img,
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
    post = ai_service.generate_post(req.prompt, req.lang)
    if "image_url" not in post or not post["image_url"]:
        post["image_url"] = ai_service.generate_skill_image(req.prompt, req.prompt)
    return post

@app.post("/api/images/generate")
def generate_image(req: ImageGenerateRequest):
    img_url = ai_service.generate_skill_image(req.skill_name, req.topic, req.category)
    return {"image_url": img_url, "skill_name": req.skill_name}

# Earnings & Income Recommendation with Past Skill Earnings Ledger
@app.get("/api/earnings/{user_id}")
def get_earnings(user_id: str):
    user = get_user(user_id)
    skills = user.get("skills") or []
    if not skills:
        return {
            "total_lifetime": 0,
            "current_month": 0,
            "completed": 0,
            "pending": 0,
            "breakdown": [],
            "options_summary": [],
            "past_transactions": [],
            "skills_breakdown": [],
            "monthly_history": [],
            "ways_to_earn": [],
            "skill_name": "General"
        }

    # Identify primary and secondary skills
    sorted_skills = sorted(skills, key=lambda s: int(s.get("experience_years", 0) or 0), reverse=True)
    primary_skill = sorted_skills[0]
    p_name = str(primary_skill.get("name") or "Skill").strip()
    s_name = str(sorted_skills[1].get("name") if len(sorted_skills) > 1 else "").strip()
    u_id = str(user.get("id", ""))
    loc = str(user.get("location_name") or user.get("district") or "Chennai")

    p_lower = p_name.lower()
    
    if "cook" in p_lower or "sweet" in p_lower or "culinary" in p_lower or "baking" in p_lower or "u-shanmuga" in u_id or "u-lakshmi" in u_id:
        transactions = [
            {
                "id": "TXN-9102",
                "date": "14 Aug 2026",
                "month": "Aug 2026",
                "option_id": "classes",
                "option_name": "🎓 Skill Workshop",
                "skill_name": p_name,
                "title": "Weekend South Indian Festive Sweets & Snacks Masterclass (6 Students)",
                "client": "SilverHands Live Cohort #4",
                "amount": 3600,
                "status": "Disbursed",
                "payment_method": "Bank Direct IMPS",
                "invoice_no": "SH-2026-0814"
            },
            {
                "id": "TXN-8941",
                "date": "08 Aug 2026",
                "month": "Aug 2026",
                "option_id": "services",
                "option_name": "🛠️ Direct Client Order",
                "skill_name": p_name,
                "title": "Bespoke 20kg Traditional Murukku & Mysore Pak Diwali Order",
                "client": "Karthik Raman (Mylapore, Chennai)",
                "amount": 4850,
                "status": "Disbursed",
                "payment_method": "UPI / GPay",
                "invoice_no": "SH-2026-0808"
            },
            {
                "id": "TXN-8620",
                "date": "29 Jul 2026",
                "month": "Jul 2026",
                "option_id": "collaborations",
                "option_name": "🤝 Community Collab",
                "skill_name": p_name,
                "title": "Mylapore Margazhi Heritage Food Fair - 120 Snack Boxes Team Collab",
                "client": "Margazhi Community Collective (3-Member Split)",
                "amount": 5400,
                "status": "Disbursed",
                "payment_method": "Bank Transfer",
                "invoice_no": "SH-2026-0729"
            },
            {
                "id": "TXN-8430",
                "date": "21 Jul 2026",
                "month": "Jul 2026",
                "option_id": "content",
                "option_name": "🎥 Content Studio",
                "skill_name": p_name,
                "title": "Ad Revenue & Creator Tips: 'Secret 10-Min Crispy Medu Vada Tutorial'",
                "client": "SilverHands Video Studio & YouTube Creator Payout",
                "amount": 2150,
                "status": "Disbursed",
                "payment_method": "Creator Wallet",
                "invoice_no": "SH-2026-0721"
            },
            {
                "id": "TXN-8112",
                "date": "11 Jul 2026",
                "month": "Jul 2026",
                "option_id": "advisory",
                "option_name": "💡 1-on-1 Consultation",
                "skill_name": s_name or "Traditional Culinary & Herb Advisory",
                "title": "Organic Balcony Kitchen Herbs & Podi Blend Formulation Advisory",
                "client": "Anita Somayaji (Adyar, Chennai)",
                "amount": 1600,
                "status": "Disbursed",
                "payment_method": "UPI",
                "invoice_no": "SH-2026-0711"
            },
            {
                "id": "TXN-7850",
                "date": "26 Jun 2026",
                "month": "Jun 2026",
                "option_id": "services",
                "option_name": "🛠️ Direct Client Order",
                "skill_name": p_name,
                "title": "Traditional Brahmin Style Sambhar & Rasam Podi Bulk Preparation (15kg)",
                "client": "Srinivasan & Co. Catering",
                "amount": 4200,
                "status": "Disbursed",
                "payment_method": "Bank IMPS",
                "invoice_no": "SH-2026-0626"
            },
            {
                "id": "TXN-7510",
                "date": "14 Jun 2026",
                "month": "Jun 2026",
                "option_id": "classes",
                "option_name": "🎓 Skill Workshop",
                "skill_name": p_name,
                "title": "Summer School Holiday Traditional Snack Cooking Batch (5 Students)",
                "client": "SilverHands Junior Chef Program",
                "amount": 2600,
                "status": "Disbursed",
                "payment_method": "Bank IMPS",
                "invoice_no": "SH-2026-0614"
            },
            {
                "id": "TXN-7204",
                "date": "22 May 2026",
                "month": "May 2026",
                "option_id": "collaborations",
                "option_name": "🤝 Community Collab",
                "skill_name": p_name,
                "title": "Temple Chithirai Festival Sweet Pongal & Laddu Community Order",
                "client": "Kapaleeshwarar Temple Volunteer Team",
                "amount": 4150,
                "status": "Disbursed",
                "payment_method": "UPI",
                "invoice_no": "SH-2026-0522"
            }
        ]
    elif "tailor" in p_lower or "embroid" in p_lower or "stitch" in p_lower or "u-meenakshi" in u_id:
        transactions = [
            {
                "id": "TXN-9102",
                "date": "15 Aug 2026",
                "month": "Aug 2026",
                "option_id": "services",
                "option_name": "🛠️ Direct Client Order",
                "skill_name": p_name,
                "title": "Bridal Kanchipuram Silk Saree Blouse Zari & Maggam Hand Embroidery",
                "client": "Divya Narayanan (T. Nagar, Chennai)",
                "amount": 5200,
                "status": "Disbursed",
                "payment_method": "UPI / GPay",
                "invoice_no": "SH-2026-0815"
            },
            {
                "id": "TXN-8941",
                "date": "06 Aug 2026",
                "month": "Aug 2026",
                "option_id": "classes",
                "option_name": "🎓 Skill Workshop",
                "skill_name": p_name,
                "title": "Weekend Blouse Neck Pattern Cutting & Aari Work Intensive Workshop",
                "client": "SilverHands Craft Learners (5 Students)",
                "amount": 3250,
                "status": "Disbursed",
                "payment_method": "Bank IMPS",
                "invoice_no": "SH-2026-0806"
            },
            {
                "id": "TXN-8620",
                "date": "27 Jul 2026",
                "month": "Jul 2026",
                "option_id": "collaborations",
                "option_name": "🤝 Community Collab",
                "skill_name": p_name,
                "title": "Festive Handloom Exhibition - Saree Border Customization Team Stall",
                "client": "Chennai Artisan Collective (Joint Venture)",
                "amount": 4900,
                "status": "Disbursed",
                "payment_method": "Bank Transfer",
                "invoice_no": "SH-2026-0727"
            },
            {
                "id": "TXN-8430",
                "date": "18 Jul 2026",
                "month": "Jul 2026",
                "option_id": "content",
                "option_name": "🎥 Content Studio",
                "skill_name": p_name,
                "title": "Video Monetization: 'Perfect Sari Blouse Neck Embroidery Tutorial'",
                "client": "SilverHands Video Studio & Ad Partners",
                "amount": 1950,
                "status": "Disbursed",
                "payment_method": "Creator Wallet",
                "invoice_no": "SH-2026-0718"
            },
            {
                "id": "TXN-8112",
                "date": "09 Jul 2026",
                "month": "Jul 2026",
                "option_id": "advisory",
                "option_name": "💡 1-on-1 Consultation",
                "skill_name": p_name,
                "title": "Bridal Trousseau Fabric Selection & Silhouette Styling Consultation",
                "client": "Pooja Sundar (Anna Nagar)",
                "amount": 1500,
                "status": "Disbursed",
                "payment_method": "UPI",
                "invoice_no": "SH-2026-0709"
            },
            {
                "id": "TXN-7850",
                "date": "24 Jun 2026",
                "month": "Jun 2026",
                "option_id": "services",
                "option_name": "🛠️ Direct Client Order",
                "skill_name": p_name,
                "title": "Handmade Cotton Kurtis & Designer Yoke Stitching (3 Pieces)",
                "client": "Radha Venkataraman",
                "amount": 3400,
                "status": "Disbursed",
                "payment_method": "UPI",
                "invoice_no": "SH-2026-0624"
            },
            {
                "id": "TXN-7510",
                "date": "11 Jun 2026",
                "month": "Jun 2026",
                "option_id": "classes",
                "option_name": "🎓 Skill Workshop",
                "skill_name": p_name,
                "title": "Basic Sewing Machine Maintenance & Straight Stitching Class",
                "client": "SilverHands Evening Batch (4 Students)",
                "amount": 2400,
                "status": "Disbursed",
                "payment_method": "Bank IMPS",
                "invoice_no": "SH-2026-0611"
            },
            {
                "id": "TXN-7204",
                "date": "19 May 2026",
                "month": "May 2026",
                "option_id": "collaborations",
                "option_name": "🤝 Community Collab",
                "skill_name": p_name,
                "title": "School Re-Opening Uniform Stitching Collaborative Bulk Order",
                "client": "Velachery Tailoring Guild",
                "amount": 4600,
                "status": "Disbursed",
                "payment_method": "Bank Transfer",
                "invoice_no": "SH-2026-0519"
            }
        ]
    elif "math" in p_lower or "tutor" in p_lower or "teach" in p_lower or "u-saraswati" in u_id:
        transactions = [
            {
                "id": "TXN-9102",
                "date": "15 Aug 2026",
                "month": "Aug 2026",
                "option_id": "classes",
                "option_name": "🎓 Skill Workshop",
                "skill_name": p_name,
                "title": "Vedic Mathematics Fast Mental Calculation 8-Day Summer Workshop",
                "client": "SilverHands Learning Cohort (8 Students)",
                "amount": 4800,
                "status": "Disbursed",
                "payment_method": "Bank IMPS",
                "invoice_no": "SH-2026-0815"
            },
            {
                "id": "TXN-8941",
                "date": "07 Aug 2026",
                "month": "Aug 2026",
                "option_id": "services",
                "option_name": "🛠️ Direct Client Order",
                "skill_name": p_name,
                "title": "1-on-1 Class 10 CBSE Board Exam Intensive Mathematics Tuition (Monthly)",
                "client": "Parent: Ramesh Venkat (Adyar)",
                "amount": 4200,
                "status": "Disbursed",
                "payment_method": "UPI / GPay",
                "invoice_no": "SH-2026-0807"
            },
            {
                "id": "TXN-8620",
                "date": "28 Jul 2026",
                "month": "Jul 2026",
                "option_id": "collaborations",
                "option_name": "🤝 Community Collab",
                "skill_name": p_name,
                "title": "Community Education Trust - STEM & Olympiad Mentorship Camp",
                "client": "Adyar Teachers Collective",
                "amount": 5100,
                "status": "Disbursed",
                "payment_method": "Bank Transfer",
                "invoice_no": "SH-2026-0728"
            },
            {
                "id": "TXN-8430",
                "date": "20 Jul 2026",
                "month": "Jul 2026",
                "option_id": "content",
                "option_name": "🎥 Content Studio",
                "skill_name": p_name,
                "title": "Creator Studio Royalty: 'Solve 3-Digit Multiplication in 5 Seconds'",
                "client": "SilverHands EdTech Creator Program",
                "amount": 2300,
                "status": "Disbursed",
                "payment_method": "Creator Wallet",
                "invoice_no": "SH-2026-0720"
            },
            {
                "id": "TXN-8112",
                "date": "10 Jul 2026",
                "month": "Jul 2026",
                "option_id": "advisory",
                "option_name": "💡 1-on-1 Consultation",
                "skill_name": p_name,
                "title": "High School Exam Strategy & Math Anxiety Counseling Session",
                "client": "Parent: Meera Krishnan (Besant Nagar)",
                "amount": 1500,
                "status": "Disbursed",
                "payment_method": "UPI",
                "invoice_no": "SH-2026-0710"
            },
            {
                "id": "TXN-7850",
                "date": "25 Jun 2026",
                "month": "Jun 2026",
                "option_id": "classes",
                "option_name": "🎓 Skill Workshop",
                "skill_name": p_name,
                "title": "Junior Speed Math & Times Tables Foundation Batch (6 Students)",
                "client": "SilverHands Kids Academy",
                "amount": 3600,
                "status": "Disbursed",
                "payment_method": "Bank IMPS",
                "invoice_no": "SH-2026-0625"
            },
            {
                "id": "TXN-7510",
                "date": "12 Jun 2026",
                "month": "Jun 2026",
                "option_id": "services",
                "option_name": "🛠️ Direct Client Order",
                "skill_name": p_name,
                "title": "Class 9 State Board Quadratic Equations Crash Course (5 Sessions)",
                "client": "Parent: Balaji R. (Mylapore)",
                "amount": 3000,
                "status": "Disbursed",
                "payment_method": "UPI",
                "invoice_no": "SH-2026-0612"
            },
            {
                "id": "TXN-7204",
                "date": "20 May 2026",
                "month": "May 2026",
                "option_id": "collaborations",
                "option_name": "🤝 Community Collab",
                "skill_name": p_name,
                "title": "Neighborhood Summer Camp Aptitude & Logic Games Workshop",
                "client": "Mylapore Youth Club Collaboration",
                "amount": 4200,
                "status": "Disbursed",
                "payment_method": "Bank Transfer",
                "invoice_no": "SH-2026-0520"
            }
        ]
    elif "craft" in p_lower or "clay" in p_lower or "art" in p_lower or "u-kamala" in u_id:
        transactions = [
            {
                "id": "TXN-9102",
                "date": "14 Aug 2026",
                "month": "Aug 2026",
                "option_id": "services",
                "option_name": "🛠️ Direct Client Order",
                "skill_name": p_name,
                "title": "Handcrafted Terracotta Diya & Return Gifts for Wedding (100 Pcs)",
                "client": "Venkatesh S. (Velachery, Chennai)",
                "amount": 5400,
                "status": "Disbursed",
                "payment_method": "UPI / GPay",
                "invoice_no": "SH-2026-0814"
            },
            {
                "id": "TXN-8941",
                "date": "05 Aug 2026",
                "month": "Aug 2026",
                "option_id": "classes",
                "option_name": "🎓 Skill Workshop",
                "skill_name": p_name,
                "title": "Eco-Friendly Clay Modeling & Terracotta Jewelry Masterclass (6 Students)",
                "client": "SilverHands Art Academy",
                "amount": 3300,
                "status": "Disbursed",
                "payment_method": "Bank IMPS",
                "invoice_no": "SH-2026-0805"
            },
            {
                "id": "TXN-8620",
                "date": "26 Jul 2026",
                "month": "Jul 2026",
                "option_id": "collaborations",
                "option_name": "🤝 Community Collab",
                "skill_name": p_name,
                "title": "Chennai Green Expo - Handmade Jute Bags & Clay Artifacts Joint Stall",
                "client": "Velachery Eco-Women Collective (Shared Revenue)",
                "amount": 5200,
                "status": "Disbursed",
                "payment_method": "Bank Transfer",
                "invoice_no": "SH-2026-0726"
            },
            {
                "id": "TXN-8430",
                "date": "17 Jul 2026",
                "month": "Jul 2026",
                "option_id": "content",
                "option_name": "🎥 Content Studio",
                "skill_name": p_name,
                "title": "Tutorial Video Payout: 'Terracotta Clay Modeling & Handcraft Gift Tutorial'",
                "client": "SilverHands Video Studio & Ad Network",
                "amount": 1850,
                "status": "Disbursed",
                "payment_method": "Creator Wallet",
                "invoice_no": "SH-2026-0717"
            },
            {
                "id": "TXN-8112",
                "date": "08 Jul 2026",
                "month": "Jul 2026",
                "option_id": "advisory",
                "option_name": "💡 1-on-1 Consultation",
                "skill_name": p_name,
                "title": "Zero-Plastic Wedding Return Gift Packaging & Sourcing Advisory",
                "client": "Deepa Sundaram (Sholinganallur)",
                "amount": 1400,
                "status": "Disbursed",
                "payment_method": "UPI",
                "invoice_no": "SH-2026-0708"
            },
            {
                "id": "TXN-7850",
                "date": "23 Jun 2026",
                "month": "Jun 2026",
                "option_id": "services",
                "option_name": "🛠️ Direct Client Order",
                "skill_name": p_name,
                "title": "Custom Painted Terracotta Wall Hanging Plates (Set of 6)",
                "client": "Heritage Living Interiors",
                "amount": 3800,
                "status": "Disbursed",
                "payment_method": "Bank IMPS",
                "invoice_no": "SH-2026-0623"
            },
            {
                "id": "TXN-7510",
                "date": "10 Jun 2026",
                "month": "Jun 2026",
                "option_id": "classes",
                "option_name": "🎓 Skill Workshop",
                "skill_name": p_name,
                "title": "Traditional Kolam & Rangoli Art Powder Blending Workshop",
                "client": "SilverHands Cultural Studio (5 Students)",
                "amount": 2500,
                "status": "Disbursed",
                "payment_method": "Bank IMPS",
                "invoice_no": "SH-2026-0610"
            },
            {
                "id": "TXN-7204",
                "date": "18 May 2026",
                "month": "May 2026",
                "option_id": "collaborations",
                "option_name": "🤝 Community Collab",
                "skill_name": p_name,
                "title": "Community Temple Kolam & Festival Eco-Decoration Collective",
                "client": "Mylapore Heritage Festival Team",
                "amount": 4400,
                "status": "Disbursed",
                "payment_method": "Bank Transfer",
                "invoice_no": "SH-2026-0518"
            }
        ]
    else:
        exp = int(primary_skill.get("experience_years", 10) or 10)
        base_rate = max(1800, exp * 180)
        transactions = [
            {
                "id": "TXN-9102",
                "date": "14 Aug 2026",
                "month": "Aug 2026",
                "option_id": "services",
                "option_name": "🛠️ Direct Client Order",
                "skill_name": p_name,
                "title": f"Custom Bespoke {p_name} Specialized Client Assignment",
                "client": f"Verified Local Client ({loc})",
                "amount": int(base_rate * 1.4),
                "status": "Disbursed",
                "payment_method": "UPI / GPay",
                "invoice_no": "SH-2026-0814"
            },
            {
                "id": "TXN-8941",
                "date": "06 Aug 2026",
                "month": "Aug 2026",
                "option_id": "classes",
                "option_name": "🎓 Skill Workshop",
                "skill_name": p_name,
                "title": f"Weekend {p_name} Practical Masterclass (5 Students)",
                "client": "SilverHands Live Cohort #2",
                "amount": int(base_rate * 1.1),
                "status": "Disbursed",
                "payment_method": "Bank IMPS",
                "invoice_no": "SH-2026-0806"
            },
            {
                "id": "TXN-8620",
                "date": "27 Jul 2026",
                "month": "Jul 2026",
                "option_id": "collaborations",
                "option_name": "🤝 Community Collab",
                "skill_name": p_name,
                "title": f"{p_name} Community Group Project & Collective Team Order",
                "client": "Neighborhood SilverHands Collective",
                "amount": int(base_rate * 1.6),
                "status": "Disbursed",
                "payment_method": "Bank Transfer",
                "invoice_no": "SH-2026-0727"
            },
            {
                "id": "TXN-8430",
                "date": "19 Jul 2026",
                "month": "Jul 2026",
                "option_id": "content",
                "option_name": "🎥 Content Studio",
                "skill_name": p_name,
                "title": f"Creator Studio Ad Revenue & Tips: '{p_name} Essentials'",
                "client": "SilverHands Video Studio & Ad Network",
                "amount": int(base_rate * 0.7),
                "status": "Disbursed",
                "payment_method": "Creator Wallet",
                "invoice_no": "SH-2026-0719"
            },
            {
                "id": "TXN-8112",
                "date": "09 Jul 2026",
                "month": "Jul 2026",
                "option_id": "advisory",
                "option_name": "💡 1-on-1 Consultation",
                "skill_name": p_name,
                "title": f"1-on-1 {p_name} Advisory & Strategic Guidance Session",
                "client": f"Consultation Client ({loc})",
                "amount": int(base_rate * 0.55),
                "status": "Disbursed",
                "payment_method": "UPI",
                "invoice_no": "SH-2026-0709"
            },
            {
                "id": "TXN-7850",
                "date": "24 Jun 2026",
                "month": "Jun 2026",
                "option_id": "services",
                "option_name": "🛠️ Direct Client Order",
                "skill_name": p_name,
                "title": f"Direct Milestone Service Order for {p_name}",
                "client": "Repeat Community Client",
                "amount": int(base_rate * 1.25),
                "status": "Disbursed",
                "payment_method": "Bank IMPS",
                "invoice_no": "SH-2026-0624"
            },
            {
                "id": "TXN-7510",
                "date": "12 Jun 2026",
                "month": "Jun 2026",
                "option_id": "classes",
                "option_name": "🎓 Skill Workshop",
                "skill_name": p_name,
                "title": f"Introductory {p_name} Online Webinar & Hands-on Session",
                "client": "SilverHands Foundation Learners",
                "amount": int(base_rate * 0.9),
                "status": "Disbursed",
                "payment_method": "Bank IMPS",
                "invoice_no": "SH-2026-0612"
            },
            {
                "id": "TXN-7204",
                "date": "19 May 2026",
                "month": "May 2026",
                "option_id": "collaborations",
                "option_name": "🤝 Community Collab",
                "skill_name": p_name,
                "title": f"Joint Community Exhibition & {p_name} Service Delivery",
                "client": "Local District Association",
                "amount": int(base_rate * 1.35),
                "status": "Disbursed",
                "payment_method": "Bank Transfer",
                "invoice_no": "SH-2026-0519"
            }
        ]

    # Calculate Totals & Summaries
    total_lifetime = sum(t["amount"] for t in transactions)
    current_month_txns = [t for t in transactions if "Aug 2026" in t.get("month", "")]
    current_month = sum(t["amount"] for t in current_month_txns)
    completed = total_lifetime
    pending = 1800  # Active in-escrow payment

    # Options aggregation
    options_meta = {
        "classes": {"name": "Skill Workshops & Masterclasses", "icon": "🎓", "badge": "High Hourly Value", "desc": "Teaching small-batch live offline & online workshops"},
        "services": {"name": "Direct Client Services & Custom Orders", "icon": "🛠️", "badge": "Bespoke Gigs", "desc": "Direct bespoke orders, catering, tailoring, 1-on-1 assignments"},
        "collaborations": {"name": "Community Team Collaborations", "icon": "🤝", "badge": "Group Power", "desc": "Split payouts from large community festival and bulk orders"},
        "content": {"name": "Digital Content Studio & Tutorials", "icon": "🎥", "badge": "Passive Revenue", "desc": "Ad revenue, viewer tips & video tutorial royalties"},
        "advisory": {"name": "1-on-1 Advisory & Consultations", "icon": "💡", "badge": "Knowledge Sharing", "desc": "Personalized strategy sessions and expert guidance"}
    }

    options_summary = []
    breakdown_list = []
    for opt_id, meta in options_meta.items():
        opt_txns = [t for t in transactions if t.get("option_id") == opt_id]
        opt_amount = sum(t["amount"] for t in opt_txns)
        opt_count = len(opt_txns)
        opt_pct = round((opt_amount / total_lifetime * 100), 1) if total_lifetime > 0 else 0
        options_summary.append({
            "id": opt_id,
            "name": meta["name"],
            "icon": meta["icon"],
            "amount": opt_amount,
            "count": opt_count,
            "percentage": opt_pct,
            "badge": meta["badge"],
            "desc": meta["desc"]
        })
        breakdown_list.append({
            "source": meta["name"],
            "amount": opt_amount,
            "percentage": opt_pct,
            "icon": meta["icon"]
        })

    # Sort options by highest amount
    options_summary.sort(key=lambda x: x["amount"], reverse=True)

    # Monthly Trends
    months = ["May 2026", "Jun 2026", "Jul 2026", "Aug 2026"]
    monthly_history = []
    for m in months:
        m_txns = [t for t in transactions if t.get("month", "").startswith(m.split()[0])]
        m_amt = sum(t["amount"] for t in m_txns)
        monthly_history.append({
            "month": m + (" (Current)" if "Aug" in m else ""),
            "amount": m_amt,
            "gigs_count": len(m_txns)
        })

    # Skills Breakdown
    skills_breakdown = []
    if len(sorted_skills) > 1 and s_name:
        p_amt = int(total_lifetime * 0.72)
        s_amt = total_lifetime - p_amt
        skills_breakdown = [
            {"skill": p_name, "amount": p_amt, "percentage": 72, "experience_years": primary_skill.get("experience_years", 10)},
            {"skill": s_name, "amount": s_amt, "percentage": 28, "experience_years": sorted_skills[1].get("experience_years", 5)}
        ]
    else:
        skills_breakdown = [
            {"skill": p_name, "amount": total_lifetime, "percentage": 100, "experience_years": primary_skill.get("experience_years", 10)}
        ]

    # AI Ways to Earn Next
    ways_to_earn = [
        {
            "option_id": "services",
            "title": f"1. Custom {p_name} Direct Client Orders",
            "potential": "₹5,000 – ₹12,000 / month",
            "desc": f"Accept direct bespoke {p_name.lower()} client requests and local custom orders.",
            "action_text": "View Open Client Requests"
        },
        {
            "option_id": "classes",
            "title": f"2. Weekend {p_name} Paid Masterclasses",
            "potential": "₹4,000 – ₹9,000 / month",
            "desc": f"Host interactive 4-session workshops teaching fundamental {p_name.lower()} techniques.",
            "action_text": "Create Next Class Batch"
        },
        {
            "option_id": "collaborations",
            "title": f"3. Community Project & Festival Collaborations",
            "potential": "₹6,000 – ₹15,000 / event",
            "desc": f"Join neighborhood multi-member teams for bulk festival and exhibition orders.",
            "action_text": "Explore Team Collaborations"
        },
        {
            "option_id": "content",
            "title": f"4. SilverHands Creator Studio Video Tutorials",
            "potential": "₹2,000 – ₹5,000 / month",
            "desc": f"Publish 5-10 minute {p_name.lower()} tutorials with AI auto-subtitles and earn viewer tips & ad share.",
            "action_text": "Record New Video"
        }
    ]

    return {
        "user_id": u_id,
        "user_name": user.get("name", "Member"),
        "skill_name": p_name,
        "total_lifetime": total_lifetime,
        "current_month": current_month,
        "completed": completed,
        "pending": pending,
        "options_summary": options_summary,
        "breakdown": breakdown_list,
        "past_transactions": transactions,
        "skills_breakdown": skills_breakdown,
        "monthly_history": monthly_history,
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
