"""
SilverHands SQLite Database Manager
Supports persistent user authentication (email sign-up/login), essential onboarding details
(district, taluk, state, education, contact), spatial distance calculations,
and skill strength assessment scores.
"""
import sqlite3
import json
import math
import os
from typing import Dict, List, Any, Optional
try:
    from .seed_data import (
        INITIAL_USERS,
        INITIAL_OPPORTUNITIES,
        INITIAL_COLLABORATIONS,
        INITIAL_CLASSES,
        INITIAL_VIDEOS,
        INITIAL_EARNINGS
    )
except ImportError:
    from seed_data import (
        INITIAL_USERS,
        INITIAL_OPPORTUNITIES,
        INITIAL_COLLABORATIONS,
        INITIAL_CLASSES,
        INITIAL_VIDEOS,
        INITIAL_EARNINGS
    )

DB_PATH = os.path.join(os.path.dirname(__file__), "silverhands.db")


def get_primary_skill(user: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Return a single top-ranked skill based on experience, fallback-safe for empty profiles."""
    skills = user.get("skills") or []
    if not skills:
        return None
    return max(skills, key=lambda skill: int(skill.get("experience_years", 0) or 0))


def get_recommended_nearby_jobs(user: Dict[str, Any], opportunities: List[Dict[str, Any]], limit: int = 3) -> List[Dict[str, Any]]:
    """Filter opportunities to the current user's primary skill category and nearby location."""
    profile_skill = get_primary_skill(user)
    primary_category = (profile_skill or {}).get("category")
    primary_name = (profile_skill or {}).get("name", "")
    user_lat = user.get("latitude", 13.0339)
    user_lon = user.get("longitude", 80.2696)

    matches = []
    for opp in opportunities:
        category = opp.get("category") or ""
        job_name = opp.get("title") or ""
        if primary_category and category != primary_category:
            if not primary_name or primary_name.lower() not in job_name.lower():
                continue
        opp_lat = opp.get("latitude", user_lat)
        opp_lon = opp.get("longitude", user_lon)
        distance = haversine_distance(user_lat, user_lon, opp_lat, opp_lon)
        opp_copy = dict(opp)
        opp_copy["distance_km"] = round(distance, 1)
        matches.append(opp_copy)

    matches.sort(key=lambda opp: (opp.get("match_score", 0), -(opp.get("distance_km", 9999))), reverse=True)
    return matches[:limit]


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        value = row[idx]
        if isinstance(value, str) and (value.startswith("{") or value.startswith("[")):
            try:
                value = json.loads(value)
            except Exception:
                pass
        d[col[0]] = value
    return d

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    return conn

def init_db():
    """Initializes schema and seeds initial data if database is empty."""
    conn = get_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT DEFAULT 'password123',
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        role TEXT,
        phone TEXT,
        district TEXT,
        taluk TEXT,
        state TEXT DEFAULT 'Tamil Nadu',
        education TEXT,
        language TEXT DEFAULT 'ta',
        location_name TEXT,
        latitude REAL,
        longitude REAL,
        avatar_url TEXT,
        trust_score INTEGER DEFAULT 95,
        skill_strength_score INTEGER DEFAULT 92,
        identity_verified BOOLEAN DEFAULT 1,
        rating REAL DEFAULT 4.8,
        reviews_count INTEGER DEFAULT 10,
        completed_jobs INTEGER DEFAULT 12,
        bio TEXT
    )
    """)

    # Skills table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_skills (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        confidence TEXT,
        experience_years INTEGER,
        proficiency TEXT,
        can_teach BOOLEAN DEFAULT 1,
        can_collaborate BOOLEAN DEFAULT 1,
        preferred_work TEXT,
        specializations TEXT,
        reasoning TEXT,
        earning_paths TEXT,
        confirmed BOOLEAN DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    # Opportunities table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS opportunities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        location_name TEXT,
        latitude REAL,
        longitude REAL,
        distance_km REAL,
        date TEXT,
        time TEXT,
        expected_earning INTEGER,
        individual_earning INTEGER,
        work_type TEXT,
        match_score INTEGER,
        required_skills TEXT,
        description TEXT,
        collaborative_project BOOLEAN DEFAULT 0,
        target_team_size INTEGER DEFAULT 1
    )
    """)

    # Collaborations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS collaborations (
        id TEXT PRIMARY KEY,
        project_name TEXT NOT NULL,
        opportunity_id TEXT,
        total_value INTEGER,
        my_share INTEGER,
        status TEXT,
        target_capacity INTEGER,
        unit_type TEXT,
        members TEXT
    )
    """)

    # Classes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        instructor TEXT NOT NULL,
        category TEXT NOT NULL,
        fee INTEGER,
        duration TEXT,
        schedule TEXT,
        mode TEXT,
        enrolled_count INTEGER DEFAULT 0,
        max_students INTEGER DEFAULT 10,
        description TEXT,
        curriculum TEXT
    )
    """)

    # Videos table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        category TEXT NOT NULL,
        language TEXT DEFAULT 'ta',
        views INTEGER DEFAULT 0,
        watch_time_hours INTEGER DEFAULT 0,
        followers INTEGER DEFAULT 0,
        estimated_earning INTEGER DEFAULT 0,
        thumbnail TEXT,
        video_url TEXT,
        tags TEXT,
        subtitles_ta TEXT,
        subtitles_en TEXT
    )
    """)

    # Notifications table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read BOOLEAN DEFAULT 0
    )
    """)

    conn.commit()

    # Check if Lakshmi user has email set
    cursor.execute("SELECT COUNT(*) as cnt FROM users")
    count = cursor.fetchone()["cnt"]
    if count == 0:
        seed_database(conn)
    else:
        # Migration: ensure user schema matches the app expectations for older SQLite databases.
        existing_columns = [row["name"] for row in cursor.execute("PRAGMA table_info(users)").fetchall()]
        for column_name, column_sql in {
            "password": "TEXT DEFAULT 'password123'",
            "district": "TEXT",
            "taluk": "TEXT",
            "state": "TEXT DEFAULT 'Tamil Nadu'",
            "education": "TEXT",
            "skill_strength_score": "INTEGER DEFAULT 92",
            "location_name": "TEXT",
            "latitude": "REAL",
            "longitude": "REAL",
            "avatar_url": "TEXT",
            "trust_score": "INTEGER DEFAULT 95",
            "identity_verified": "BOOLEAN DEFAULT 1",
            "rating": "REAL DEFAULT 4.8",
            "reviews_count": "INTEGER DEFAULT 10",
            "completed_jobs": "INTEGER DEFAULT 12",
            "bio": "TEXT",
            "language": "TEXT DEFAULT 'ta'",
        }.items():
            if column_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_sql}")
                except Exception:
                    pass

        try:
            cursor.execute("ALTER TABLE videos ADD COLUMN video_url TEXT")
            conn.commit()
        except Exception:
            pass

    conn.close()

def seed_database(conn):
    cursor = conn.cursor()
    # Insert users and skills
    for u in INITIAL_USERS:
        u["district"] = u.get("district", "Chennai")
        u["taluk"] = u.get("taluk", "Mylapore")
        u["state"] = u.get("state", "Tamil Nadu")
        u["education"] = u.get("education", "Higher Secondary School")
        u["skill_strength_score"] = 92
        skills = u.pop("skills", [])
        cursor.execute("""
        INSERT INTO users (id, email, password, name, age, gender, role, phone, district, taluk, state, education, language, location_name, latitude, longitude, avatar_url, trust_score, skill_strength_score, identity_verified, rating, reviews_count, completed_jobs, bio)
        VALUES (:id, :email, 'password123', :name, :age, :gender, :role, :phone, :district, :taluk, :state, :education, :language, :location_name, :latitude, :longitude, :avatar_url, :trust_score, :skill_strength_score, :identity_verified, :rating, :reviews_count, :completed_jobs, :bio)
        """, u)

        for s in skills:
            s["user_id"] = u["id"]
            s["specializations"] = json.dumps(s.get("specializations", []))
            s["earning_paths"] = json.dumps(s.get("earning_paths", []))
            cursor.execute("""
            INSERT INTO user_skills (id, user_id, name, category, confidence, experience_years, proficiency, can_teach, can_collaborate, preferred_work, specializations, reasoning, earning_paths, confirmed)
            VALUES (:id, :user_id, :name, :category, :confidence, :experience_years, :proficiency, :can_teach, :can_collaborate, :preferred_work, :specializations, :reasoning, :earning_paths, 1)
            """, s)

    # Insert opportunities
    for opp in INITIAL_OPPORTUNITIES:
        opp_copy = dict(opp)
        opp_copy["required_skills"] = json.dumps(opp_copy.get("required_skills", []))
        cursor.execute("""
        INSERT INTO opportunities (id, title, category, location_name, latitude, longitude, distance_km, date, time, expected_earning, individual_earning, work_type, match_score, required_skills, description, collaborative_project, target_team_size)
        VALUES (:id, :title, :category, :location_name, :latitude, :longitude, :distance_km, :date, :time, :expected_earning, :individual_earning, :work_type, :match_score, :required_skills, :description, :collaborative_project, :target_team_size)
        """, opp_copy)

    # Insert collaborations
    for col in INITIAL_COLLABORATIONS:
        col_copy = dict(col)
        col_copy["members"] = json.dumps(col_copy.get("members", []))
        cursor.execute("""
        INSERT INTO collaborations (id, project_name, opportunity_id, total_value, my_share, status, target_capacity, unit_type, members)
        VALUES (:id, :project_name, :opportunity_id, :total_value, :my_share, :status, :target_capacity, :unit_type, :members)
        """, col_copy)

    # Insert classes
    for cls in INITIAL_CLASSES:
        cls_copy = dict(cls)
        cls_copy["curriculum"] = json.dumps(cls_copy.get("curriculum", []))
        cursor.execute("""
        INSERT INTO classes (id, title, instructor, category, fee, duration, schedule, mode, enrolled_count, max_students, description, curriculum)
        VALUES (:id, :title, :instructor, :category, :fee, :duration, :schedule, :mode, :enrolled_count, :max_students, :description, :curriculum)
        """, cls_copy)

    # Insert videos
    for vid in INITIAL_VIDEOS:
        vid_copy = dict(vid)
        vid_copy["tags"] = json.dumps(vid_copy.get("tags", []))
        vid_copy["video_url"] = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        cursor.execute("""
        INSERT INTO videos (id, title, author, category, language, views, watch_time_hours, followers, estimated_earning, thumbnail, video_url, tags, subtitles_ta, subtitles_en)
        VALUES (:id, :title, :author, :category, :language, :views, :watch_time_hours, :followers, :estimated_earning, :thumbnail, :video_url, :tags, :subtitles_ta, :subtitles_en)
        """, vid_copy)

    conn.commit()

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

init_db()
