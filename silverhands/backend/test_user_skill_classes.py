import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from main import app, get_db

client = TestClient(app)

class TestUserSkillClasses(unittest.TestCase):
    def test_classes_filtered_for_handicrafts_user(self):
        # Kamala Natarajan has Handicrafts & Eco-Art skill (id: u-kamala-59)
        res = client.get("/api/classes?user_id=u-kamala-59")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(len(data) > 0)
        for cls in data:
            title = cls.get("title", "").lower()
            category = cls.get("category", "").lower()
            desc = cls.get("description", "").lower()
            combined = f"{title} {category} {desc}"
            self.assertTrue(
                any(term in combined for term in ["handicraft", "handcraft", "craft", "art"]),
                f"Class '{cls.get('title')}' did not match Handicrafts skill"
            )

    def test_classes_filtered_for_cooking_user(self):
        # Lakshmi Ammal has Cooking skill (id: u-lakshmi-64)
        res = client.get("/api/classes?user_id=u-lakshmi-64")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(len(data) > 0)
        for cls in data:
            title = cls.get("title", "").lower()
            category = cls.get("category", "").lower()
            desc = cls.get("description", "").lower()
            combined = f"{title} {category} {desc}"
            self.assertTrue(
                any(term in combined for term in ["cook", "cooking", "millet", "snack", "culinary", "recipe"]),
                f"Class '{cls.get('title')}' did not match Cooking skill"
            )

    def test_classes_filtered_for_tailoring_user(self):
        # Meenakshi Sundaram has Tailoring skill (id: u-meenakshi-61)
        res = client.get("/api/classes?user_id=u-meenakshi-61")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(len(data) > 0)
        for cls in data:
            title = cls.get("title", "").lower()
            category = cls.get("category", "").lower()
            desc = cls.get("description", "").lower()
            combined = f"{title} {category} {desc}"
            self.assertTrue(
                any(term in combined for term in ["tailor", "tailoring", "blouse", "embroidery", "garment", "stitch"]),
                f"Class '{cls.get('title')}' did not match Tailoring skill"
            )

if __name__ == "__main__":
    unittest.main()
