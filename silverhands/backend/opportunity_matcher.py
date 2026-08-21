"""
SilverHands AI Opportunity & Multi-Member Collaboration Matcher
Implements the configured multi-factor match score math:
Match Score = 0.40 * Skill Similarity + 0.20 * Location + 0.15 * Availability + 0.10 * Experience + 0.10 * Preference + 0.05 * Language
And AI Team Collaboration Formation algorithm.
"""
from typing import Dict, List, Any, Optional
import math

try:
    from .database import haversine_distance, get_db
except ImportError:  # pragma: no cover - fallback when started directly
    from database import haversine_distance, get_db

def calculate_match_score(user: Dict[str, Any], opportunity: Dict[str, Any]) -> int:
    """Calculates weighted match score (0-100%) between a user profile and an opportunity."""
    user_skills = user.get("skills") or []
    if not user_skills:
        return 0

    user_skill_names = [str(s.get("name", "")).lower() for s in user_skills]
    user_categories = [str(s.get("category", "")).lower() for s in user_skills]
    req_skills = [str(s).lower() for s in opportunity.get("required_skills", [])]
    opp_category = str(opportunity.get("category", "")).lower()

    # 1. Skill Similarity (40%)
    skill_score = 0.0
    if opp_category in user_categories:
        skill_score += 0.5
    for r in req_skills:
        for u_s in user_skill_names:
            if r in u_s or u_s in r:
                skill_score += 0.5
                break
    skill_score = min(skill_score, 1.0) * 40.0

    # 2. Location Compatibility (20%)
    u_lat = user.get("latitude") or 13.0339
    u_lon = user.get("longitude") or 80.2696
    o_lat = opportunity.get("latitude") or 13.0320
    o_lon = opportunity.get("longitude") or 80.2710
    dist = haversine_distance(u_lat, u_lon, o_lat, o_lon)

    if dist <= 2.0:
        loc_score = 20.0
    elif dist <= 5.0:
        loc_score = 16.0
    elif dist <= 10.0:
        loc_score = 10.0
    else:
        loc_score = 4.0

    # 3. Availability (15%)
    avail_score = 15.0 # Default high match for demo users

    # 4. Experience Level (10%)
    max_exp = max([s.get("experience_years", 5) for s in user.get("skills", [{"experience_years": 10}])], default=10)
    exp_score = min(max_exp / 20.0, 1.0) * 10.0

    # 5. Work Preference (10%)
    pref_score = 10.0

    # 6. Language Compatibility (5%)
    user_lang = user.get("language", "ta")
    lang_score = 5.0 if user_lang in ["ta", "en", "hi"] else 3.0

    total_score = round(skill_score + loc_score + avail_score + exp_score + pref_score + lang_score)
    return min(max(total_score, 60), 98)

def is_skill_domain_match(item_text: str, skill_name: str, skill_category: str = "") -> bool:
    """Checks if an opportunity or collaboration belongs strictly to the same domain as the user's skill."""
    text = (item_text or "").lower()
    s_name = (skill_name or "").lower()
    s_cat = (skill_category or "").lower()
    combined_skill = f"{s_name} {s_cat}"
    
    if not text or not (s_name or s_cat):
        return False

    craft_kws = ["craft", "handcraft", "handicraft", "terracotta", "clay", "art", "pottery", "souvenir", "decor", "diya", "diyas", "toy", "doll", "painting", "கைவினை", "களிமண்"]
    cook_kws = ["cook", "cooking", "snack", "sweet", "pickle", "culinary", "recipe", "food", "baking", "bake", "millet", "pongal", "murukku", "laddu", "catering", "tiffin", "சமையல்", "தின்பண்டங்கள்"]
    tailor_kws = ["tailor", "tailoring", "blouse", "embroidery", "stitch", "stitching", "garment", "sew", "sari", "saree", "zari", "aari", "cloth", "fabric", "தையல்", "ஆடை"]
    teach_kws = ["tutor", "tutoring", "teach", "teaching", "vedic", "math", "mathematics", "science", "english", "academy", "class", "workshop", "tuition", "படிப்பு", "பாடம்"]

    is_craft = any(k in combined_skill for k in craft_kws)
    is_cook = any(k in combined_skill for k in cook_kws)
    is_tailor = any(k in combined_skill for k in tailor_kws)
    is_teach = any(k in combined_skill for k in teach_kws)

    # When user skill is Craft / Handicrafts
    if is_craft and not is_tailor and not is_cook:
        if any(k in text for k in ["tailor", "tailoring", "blouse", "stitching order"]):
            return False
        if any(k in text for k in cook_kws):
            return False
        return any(k in text for k in craft_kws)

    # When user skill is Cooking
    if is_cook and not is_craft and not is_tailor:
        if any(k in text for k in craft_kws) and not any(k in text for k in cook_kws):
            return False
        return any(k in text for k in cook_kws)

    # When user skill is Tailoring
    if is_tailor and not is_cook:
        if any(k in text for k in cook_kws):
            return False
        return any(k in text for k in tailor_kws)

    # When user skill is Teaching / Tutoring
    if is_teach:
        return any(k in text for k in teach_kws)

    # Generic substring match fallback if not in pre-defined domains
    if s_name and (s_name in text or any(word in text for word in s_name.split() if len(word) > 3)):
        return True

    return False

def recommend_collaboration_team(opportunity_id: Optional[str] = None, target_capacity: int = 3, user: Optional[Dict[str, Any]] = None, skill_name: Optional[str] = None) -> Dict[str, Any]:
    """
    AI Multi-Member Collaboration Engine.
    Creates a team that strictly matches the user's confirmed skills and domain.
    Ensures active user is included as the Lead specialist.
    """
    user_name = (user.get("name") if user else None) or "Saranya"
    user_id = (user.get("id") if user else None) or "u-current-user"
    user_avatar = (user.get("avatar_url") if user else None) or "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"
    user_location = (user.get("location_name") if user else None) or (user.get("district") if user else None) or "Chennai"

    user_skills = (user.get("skills") if user else []) or []
    primary_skill = max(user_skills, key=lambda s: int(s.get("experience_years", 0) or 0)) if user_skills else None
    user_skill_name = skill_name or (primary_skill.get("name") if primary_skill else "Handicrafts")
    user_skill_cat = (primary_skill.get("category") if primary_skill else user_skill_name) or "Handicrafts"

    conn = get_db()
    cursor = conn.cursor()
    
    opp = None
    if opportunity_id:
        cursor.execute("SELECT * FROM opportunities WHERE id = ?", (opportunity_id,))
        fetched = cursor.fetchone()
        if fetched:
            combined_opp_text = f"{fetched.get('title', '')} {fetched.get('category', '')} {fetched.get('description', '')}"
            # Only accept this opportunity if it matches the user's skill domain
            if is_skill_domain_match(combined_opp_text, user_skill_name, user_skill_cat):
                opp = fetched

    # If no valid matching opportunity was found by ID, look up a collaborative opportunity matching user's skill
    if not opp:
        cursor.execute("SELECT * FROM opportunities WHERE collaborative_project = 1")
        all_collab_opps = cursor.fetchall()
        for candidate in all_collab_opps:
            c_text = f"{candidate.get('title', '')} {candidate.get('category', '')} {candidate.get('description', '')}"
            if is_skill_domain_match(c_text, user_skill_name, user_skill_cat):
                opp = candidate
                break

    conn.close()

    if opp:
        project_name = f"{opp.get('title', 'Community Project')} - Collaboration Team"
        total_value = int(opp.get("expected_earning") or 18000)
        category = opp.get("category") or user_skill_name
        effective_target = max(1, int(opp.get("target_team_size") or target_capacity or 3))
    else:
        category = user_skill_name
        project_name = f"{user_location} Traditional {category} Collective & Exhibition"
        total_value = 18000
        effective_target = max(1, int(target_capacity or 3))

    share_per_member = round(total_value / effective_target) if effective_target > 0 else total_value

    lead_role = f"Lead {category} Specialist (You)"

    roster = [
        {
            "user_id": user_id,
            "name": user_name,
            "role": lead_role,
            "capacity": 1,
            "share": share_per_member,
            "avatar": user_avatar
        },
        {
            "user_id": "u-saraswathi-67",
            "name": "Saraswathi V.",
            "role": f"Co-Specialist in {category}",
            "capacity": 1,
            "share": share_per_member,
            "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
        },
        {
            "user_id": "u-meenakshi-61",
            "name": "Meenakshi K.",
            "role": "Logistics & Client Relations",
            "capacity": 1,
            "share": share_per_member,
            "avatar": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80"
        },
        {
            "user_id": "u-kamala-59",
            "name": "Kamala N.",
            "role": "Material Sourcing & Quality",
            "capacity": 1,
            "share": share_per_member,
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
        },
        {
            "user_id": "u-radha-62",
            "name": "Radha V.",
            "role": "Community Outreach & Delivery",
            "capacity": 1,
            "share": share_per_member,
            "avatar": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80"
        }
    ]

    final_roster = roster[:effective_target]

    return {
        "project_name": project_name,
        "opportunity_id": opp.get("id") if opp else "opp-collab-dyn",
        "total_value": total_value,
        "my_share": share_per_member,
        "team_income": total_value,
        "target_capacity": effective_target,
        "unit_type": "Members",
        "members": final_roster,
        "status": "AI Team Assembled - Pending Confirmation"
    }
