"""
SilverHands Ecosystem Launcher
Boots the FastAPI backend server and serves the responsive frontend interface.
"""
import sys
import os
import uvicorn

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

if __name__ == "__main__":
    print("\n" + "="*60)
    print(" SILVERHANDS - Your Experience. Your Skills. Your Opportunity.")
    print("="*60)
    print(" Starting FastAPI server at: http://127.0.0.1:8000")
    print(" Language-first Multilingual AI Engine ready.")
    print(" Dual Audio/Text engine ready.")
    print(" Hackathon Guided Demo Scenario ready.")
    print("="*60 + "\n")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

