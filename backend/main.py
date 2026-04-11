from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="NutriMind AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL) if DATABASE_URL else None
SessionLocal = sessionmaker(bind=engine) if engine else None
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    bp = Column(Integer)
    sugar = Column(Integer)
    mood = Column(String)
    groceries = Column(String)
    weight = Column(Integer)
    activity = Column(String)
    water = Column(Float)
    meal = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables only if database is connected
if engine:
    Base.metadata.create_all(bind=engine)

class UserData(BaseModel):
    bp: int
    sugar: int
    mood: str
    groceries: str
    weight: int
    activity: str

@app.get("/")
def home():
    return {"message": "✅ NutriMind AI Backend is Running Successfully!"}

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
            model="gemini-2.5-flash",
            contents=prompt
        )

        water = data.weight * 0.033
        if data.activity == "moderate":
            water += 0.5
        elif data.activity == "high":
            water += 1
        water = round(water, 2)

        meal_text = response.text if hasattr(response, "text") else str(response)

        # Save to database if connected
        if SessionLocal:
            db = SessionLocal()
            user_data = User(
                bp=data.bp,
                sugar=data.sugar,
                mood=data.mood,
                groceries=data.groceries,
                weight=data.weight,
                activity=data.activity,
                water=water,
                meal=meal_text,
                created_at=datetime.utcnow()
            )
            db.add(user_data)
            db.commit()
            db.close()

        return {
            "meal": meal_text,
            "water_intake_liters": water
        }

    except Exception as e:
        return {"error": str(e)}

@app.get("/history")
def get_history():
    if not SessionLocal:
        return {"message": "Database not connected", "entries": []}
    db = SessionLocal()
    users = db.query(User).order_by(User.created_at.desc()).all()
    db.close()
    return [
        {
            "id": u.id,
            "date": u.created_at.strftime("%Y-%m-%d %H:%M"),
            "bp": u.bp,
            "sugar": u.sugar,
            "mood": u.mood,
            "groceries": u.groceries,
            "weight": u.weight,
            "activity": u.activity,
            "water": u.water,
            "meal": u.meal
        } for u in users
    ]