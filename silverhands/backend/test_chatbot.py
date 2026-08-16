import sys

sys.path.append(".")

from ai_engine import ai_service


def test_generic_silverbuddy_question_is_direct_and_helpful():
    result = ai_service.silverbuddy_query(
        "How can I start earning from cooking?",
        {"name": "Lakshmi", "skills": [{"name": "Cooking"}]},
        "en",
    )

    answer = result.get("answer", "")
    assert "I parsed your query" not in answer
    assert "How would you like me to assist" not in answer
    assert "Cooking" in answer or "earn" in answer.lower()
