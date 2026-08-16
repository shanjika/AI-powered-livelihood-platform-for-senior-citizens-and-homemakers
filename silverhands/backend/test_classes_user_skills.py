import sys

sys.path.append('.')

from ai_engine import ai_service


def test_generate_class_uses_user_defined_skill_context():
    result = ai_service.generate_class(
        "I want to teach my class",
        "Saranya",
        "en",
        user_skills=["Pottery & Clay Craft"],
    )

    title = str(result.get("title", "")).lower()
    category = str(result.get("category", "")).lower()
    assert "pottery" in title or "clay" in title
    assert "pottery" in category or "craft" in category or "art" in category
