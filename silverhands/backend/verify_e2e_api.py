import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def test_api_videos():
    # 1. Test Lakshmi Ammal (Cooking)
    print("Testing Lakshmi Ammal (u-lakshmi-64 - Cooking)...")
    req = urllib.request.Request(f"{BASE_URL}/api/videos?user_id=u-lakshmi-64")
    with urllib.request.urlopen(req) as resp:
        videos = json.loads(resp.read().decode('utf-8'))
        print(f"  Received {len(videos)} videos.")
        assert len(videos) >= 2, f"Expected >= 2 videos, got {len(videos)}"
        for v in videos:
            print(f"    - Title: {v.get('title')} | Category: {v.get('category')} | Views: {v.get('views')}")
            comb = f"{v.get('title', '')} {v.get('category', '')} {' '.join(v.get('tags', []))}".lower()
            assert any(k in comb for k in ["cook", "millet", "snack", "sweet", "pickle", "recipe", "food", "culinary", "baking"]), f"Unrelated video in cooking profile: {v.get('title')}"
            assert "tailor" not in comb or "cook" in comb, f"Tailoring video in cooking profile: {v.get('title')}"
            assert "vedic math" not in comb, f"Math video in cooking profile: {v.get('title')}"

    # 2. Test Meenakshi Sundaram (Tailoring)
    print("\nTesting Meenakshi Sundaram (u-meenakshi-61 - Tailoring)...")
    req = urllib.request.Request(f"{BASE_URL}/api/videos?user_id=u-meenakshi-61")
    with urllib.request.urlopen(req) as resp:
        videos = json.loads(resp.read().decode('utf-8'))
        print(f"  Received {len(videos)} videos.")
        assert len(videos) >= 2, f"Expected >= 2 videos, got {len(videos)}"
        for v in videos:
            print(f"    - Title: {v.get('title')} | Category: {v.get('category')} | Views: {v.get('views')}")
            comb = f"{v.get('title', '')} {v.get('category', '')} {' '.join(v.get('tags', []))}".lower()
            assert any(k in comb for k in ["tailor", "tailoring", "blouse", "embroidery", "stitch", "stitching", "garment", "sari", "bag"]), f"Unrelated video in tailoring profile: {v.get('title')}"
            assert "millet" not in comb, f"Cooking video in tailoring profile: {v.get('title')}"

    # 3. Test Generate For Skill endpoint
    print("\nTesting /api/videos/generate_for_skill...")
    payload = json.dumps({
        "user_id": "u-lakshmi-64",
        "skill_name": "Traditional Cooking",
        "category": "Cooking",
        "lang": "ta"
    }).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/videos/generate_for_skill", data=payload, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as resp:
        gen = json.loads(resp.read().decode('utf-8'))
        print(f"  Successfully auto-generated {len(gen)} Gemini AI videos on-demand:")
        for g in gen:
            print(f"    - Title: {g.get('title')} | Category: {g.get('category')}")
            print(f"      TA Subtitle: {g.get('subtitles_ta')[:40].encode('ascii', 'replace').decode('ascii')}...")
            print(f"      EN Subtitle: {g.get('subtitles_en')[:40]}...")

    print("\nALL E2E API VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api_videos()
