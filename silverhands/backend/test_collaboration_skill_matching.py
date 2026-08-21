import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from main import app, get_db, init_db

client = TestClient(app)

class TestCollaborationSkillMatching(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()

    def test_collaborations_filtered_for_handicrafts_user(self):
        # Kamala Natarajan has Handicrafts & Eco-Art skill (id: u-kamala-59)
        res = client.get("/api/collaborations?user_id=u-kamala-59")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(len(data) > 0, "Expected at least one collaboration for handicrafts user")
        
        for collab in data:
            project_name = (collab.get("project_name") or "").lower()
            members = collab.get("members") or []
            roles = " ".join([m.get("role", "") for m in members]).lower()
            combined = f"{project_name} {roles}"
            
            # Must NOT contain food / cooking terms
            self.assertFalse(
                any(term in combined for term in ["food festival", "sweet & snack", "millet sweet", "savory snack", "millet"]),
                f"Food/cooking collaboration found in handicrafts profile: {collab.get('project_name')}"
            )
            # Must contain handicraft / craft / art / pottery / terracotta terms
            self.assertTrue(
                any(term in combined for term in ["handicraft", "handcraft", "craft", "art", "pottery", "terracotta", "diya", "painting"]),
                f"Collaboration '{collab.get('project_name')}' does not match Handicrafts skill"
            )

    def test_collaborations_filtered_for_cooking_user(self):
        # Lakshmi Ammal has Cooking skill (id: u-lakshmi-64)
        res = client.get("/api/collaborations?user_id=u-lakshmi-64")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(len(data) > 0, "Expected at least one collaboration for cooking user")
        
        for collab in data:
            project_name = (collab.get("project_name") or "").lower()
            members = collab.get("members") or []
            roles = " ".join([m.get("role", "") for m in members]).lower()
            combined = f"{project_name} {roles}"
            
            self.assertTrue(
                any(term in combined for term in ["food", "snack", "sweet", "cook", "culinary"]),
                f"Collaboration '{collab.get('project_name')}' does not match Cooking skill"
            )

    def test_collaborations_filtered_for_tailoring_user(self):
        # Meenakshi Sundaram has Tailoring skill (id: u-meenakshi-61)
        res = client.get("/api/collaborations?user_id=u-meenakshi-61")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(len(data) > 0, "Expected at least one collaboration for tailoring user")
        
        for collab in data:
            project_name = (collab.get("project_name") or "").lower()
            members = collab.get("members") or []
            roles = " ".join([m.get("role", "") for m in members]).lower()
            combined = f"{project_name} {roles}"
            
            # Must NOT contain food / snack terms
            self.assertFalse(
                any(term in combined for term in ["food festival", "millet", "snack box"]),
                f"Food collaboration found in tailoring profile: {collab.get('project_name')}"
            )
            # Must contain tailoring / embroidery / zari / stitch terms
            self.assertTrue(
                any(term in combined for term in ["tailor", "embroidery", "zari", "aari", "garment", "stitch", "blouse", "sew"]),
                f"Collaboration '{collab.get('project_name')}' does not match Tailoring skill"
            )

    def test_ai_recommend_collaboration_matches_user_skill(self):
        # When creating AI Team Project for a handicrafts user
        payload = {
            "user_id": "u-kamala-59",
            "skill_name": "Handicrafts & Eco-Art"
        }
        res = client.post("/api/collaborations/recommend", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        
        project_name = (data.get("project_name") or "").lower()
        members = data.get("members") or []
        roles = " ".join([m.get("role", "") for m in members]).lower()
        combined = f"{project_name} {roles}"
        
        self.assertFalse(
            any(term in combined for term in ["food festival", "sweet & snack", "millet sweets"]),
            f"AI Team recommendation created food project for handcraft user: {data.get('project_name')}"
        )
        self.assertTrue(
            any(term in combined for term in ["handicraft", "handcraft", "craft", "art", "diya", "terracotta", "pottery"]),
            f"AI Team recommendation '{data.get('project_name')}' is not in handicrafts domain"
        )

if __name__ == "__main__":
    unittest.main()
