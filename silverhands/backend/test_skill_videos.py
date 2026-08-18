import sys
import unittest
import json
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from main import app, get_db, is_video_matching_user_skills

client = TestClient(app)

class TestSkillVideos(unittest.TestCase):
    def test_cooking_user_gets_at_least_2_videos_strictly_matched(self):
        # Lakshmi Ammal has Cooking skill (u-lakshmi-64)
        res = client.get("/api/videos?user_id=u-lakshmi-64")
        self.assertEqual(res.status_code, 200)
        videos = res.json()
        self.assertGreaterEqual(len(videos), 2, "Cooking user must receive at least 2 videos")
        
        for v in videos:
            combined = f"{v.get('title', '')} {v.get('category', '')} {' '.join(v.get('tags', []))}".lower()
            is_cooking = any(w in combined for w in ["cook", "cooking", "millet", "snack", "sweet", "pickle", "recipe", "food", "culinary", "baking"])
            self.assertTrue(is_cooking, f"Video '{v.get('title')}' is not strictly cooking-related")
            # Ensure non-cooking domains are NOT in this video
            self.assertFalse("tailor" in combined and "cook" not in combined, f"Found unrelated tailoring video '{v.get('title')}'")
            self.assertFalse("vedic math" in combined, f"Found unrelated math video '{v.get('title')}'")

    def test_tailoring_user_gets_at_least_2_videos_strictly_matched(self):
        # Meenakshi Sundaram has Tailoring skill (u-meenakshi-61)
        res = client.get("/api/videos?user_id=u-meenakshi-61")
        self.assertEqual(res.status_code, 200)
        videos = res.json()
        self.assertGreaterEqual(len(videos), 2, "Tailoring user must receive at least 2 videos")
        
        for v in videos:
            combined = f"{v.get('title', '')} {v.get('category', '')} {' '.join(v.get('tags', []))}".lower()
            is_tailoring = any(w in combined for w in ["tailor", "tailoring", "blouse", "embroidery", "stitch", "stitching", "garment", "sari", "zari", "bag"])
            self.assertTrue(is_tailoring, f"Video '{v.get('title')}' is not strictly tailoring-related")
            self.assertFalse("millet" in combined, f"Found unrelated cooking video in tailoring profile")

    def test_gardening_user_auto_generates_gemini_videos(self):
        # Create temporary user with Organic Gardening skill
        test_uid = f"u-test-gardening-{os.urandom(3).hex()}"
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO users (id, email, password, name, age, gender, role, phone, district, taluk, state, education, language, location_name, latitude, longitude, avatar_url, trust_score, skill_strength_score, identity_verified, rating, reviews_count, completed_jobs, bio)
        VALUES (?, 'gardener@silverhands.in', 'password123', 'Radha Gardener', 60, 'Female', 'Gardener', '+91 98409 99999', 'Chennai', 'Mylapore', 'Tamil Nadu', 'Graduate', 'ta', 'Chennai', 13.0339, 80.2696, '', 95, 90, 1, 4.8, 10, 5, 'Organic Gardening Expert')
        """, (test_uid,))
        cursor.execute("""
        INSERT INTO user_skills (id, user_id, name, category, confidence, experience_years, proficiency, can_teach, can_collaborate, preferred_work, specializations, reasoning, earning_paths, confirmed)
        VALUES (?, ?, 'Organic Gardening', 'Gardening', 'High', 15, 'Expert', 1, 1, 'Local', ?, '15 years gardening', ?, 1)
        """, (f"s-garden-{os.urandom(3).hex()}", test_uid, json.dumps(["Terrace Garden", "Composting"]), json.dumps(["Garden Consulting"])))
        conn.commit()
        conn.close()

        res = client.get(f"/api/videos?user_id={test_uid}")
        self.assertEqual(res.status_code, 200)
        videos = res.json()
        self.assertGreaterEqual(len(videos), 2, "Gardening user must receive at least 2 videos")
        for v in videos:
            combined = f"{v.get('title', '')} {v.get('category', '')} {' '.join(v.get('tags', []))}".lower()
            is_gardening = any(w in combined for w in ["garden", "gardening", "terrace", "compost", "pest", "plant", "soil", "vegetable"])
            self.assertTrue(is_gardening, f"Video '{v.get('title')}' is not strictly gardening-related")

    def test_user_without_skills_returns_empty(self):
        # Create user without skills
        test_uid = f"u-test-noskills-{os.urandom(3).hex()}"
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO users (id, email, password, name, age, gender, role, phone, district, taluk, state, education, language, location_name, latitude, longitude, avatar_url, trust_score, skill_strength_score, identity_verified, rating, reviews_count, completed_jobs, bio)
        VALUES (?, 'noskills@silverhands.in', 'password123', 'No Skills User', 55, 'Male', 'Member', '+91 98408 88888', 'Chennai', 'Mylapore', 'Tamil Nadu', 'Graduate', 'ta', 'Chennai', 13.0339, 80.2696, '', 90, 80, 1, 4.5, 0, 0, 'New Member')
        """, (test_uid,))
        conn.commit()
        conn.close()

        res = client.get(f"/api/videos?user_id={test_uid}")
        self.assertEqual(res.status_code, 200)
        videos = res.json()
        self.assertEqual(len(videos), 0, "User without confirmed skills must return empty list")

if __name__ == "__main__":
    unittest.main()
