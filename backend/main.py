from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from datetime import datetime
import os
from dotenv import load_dotenv

# Load .env for local (Render will use env vars)
load_dotenv()

app = FastAPI(title="NutriMind AI")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini (your requested model)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Request model
class UserData(BaseModel):
    bp: int
    sugar: int
    mood: str
    groceries: str
    weight: int
    activity: str

@app.get("/")
def home():
    return {"message": "✅ NutriMind AI is running!"}

@app.post("/meal")
def get_meal(data: UserData):
    try:
        prompt = f"""
        Suggest a healthy Indian meal based on:
        BP: {data.bp}
        Sugar: {data.sugar}
        Mood: {data.mood}
        Groceries: {data.groceries}
        """

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=prompt
        )

        # Water calculation
        water = data.weight * 0.033
        if data.activity == "moderate":
            water += 0.5
        elif data.activity == "high":
            water += 1
        water = round(water, 2)

        meal_text = response.text if hasattr(response, 'text') else str(response)

        return {
            "meal": meal_text,
            "water_intake_liters": water
        }

    except Exception as e:
        return {"error": str(e)}

@app.get("/history")
def get_history():
    return {"message": "Database not connected yet", "entries": []}