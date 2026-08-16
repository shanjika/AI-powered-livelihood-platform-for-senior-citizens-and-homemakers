import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from database import get_primary_skill, get_recommended_nearby_jobs


class UserProfileTests(unittest.TestCase):
    def test_get_primary_skill_uses_highest_experience(self):
        user = {
            "skills": [
                {"name": "Culinary Teaching", "category": "Teaching", "experience_years": 10},
                {"name": "Traditional Cooking", "category": "Cooking", "experience_years": 25},
                {"name": "Tailoring", "category": "Tailoring", "experience_years": 12},
            ]
        }

        skill = get_primary_skill(user)

        self.assertEqual(skill["name"], "Traditional Cooking")
        self.assertEqual(skill["category"], "Cooking")

    def test_get_recommended_nearby_jobs_returns_user_specific_matches(self):
        user = {
            "id": "u-test-1",
            "name": "Test User",
            "latitude": 13.0339,
            "longitude": 80.2696,
            "skills": [{"name": "Traditional Cooking", "category": "Cooking", "experience_years": 25}],
        }
        opportunities = [
            {"id": "opp-1", "title": "Cooking Job", "category": "Cooking", "latitude": 13.0340, "longitude": 80.2700, "distance_km": 0.8, "match_score": 96},
            {"id": "opp-2", "title": "Tailoring Job", "category": "Tailoring", "latitude": 13.1000, "longitude": 80.3000, "distance_km": 8.0, "match_score": 64},
        ]

        jobs = get_recommended_nearby_jobs(user, opportunities)

        self.assertEqual(jobs[0]["id"], "opp-1")
        self.assertEqual(len(jobs), 1)


if __name__ == "__main__":
    unittest.main()
