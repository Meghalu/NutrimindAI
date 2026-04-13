import React, { useState } from "react";

function App() {
  const [bp, setBp] = useState("");
  const [sugar, setSugar] = useState("");
  const [mood, setMood] = useState("");
  const [groceries, setGroceries] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("low");

  const [meal, setMeal] = useState("");
  const [water, setWater] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "https://nutrimindai-kaoo.onrender.com";

  // Dropdown Options
  const bpOptions = ["Below 120", "120-140", "140-160", "Above 160"];
  const sugarOptions = ["Normal (<140)", "Prediabetes (140-199)", "High (>=200)"];
  const moodOptions = [
    "Happy", "Energetic", "Tired", "Stressed", 
    "Angry", "Calm", "Sad", "Motivated", "Anxious"
  ];

  const getMeal = async () => {
    if (!bp || !sugar || !mood || !groceries || !weight) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    const data = {
      bp: bp.includes("Below") ? 110 : bp.includes("120-140") ? 130 : bp.includes("140-160") ? 150 : 170,
      sugar: sugar.includes("Normal") ? 120 : sugar.includes("Prediabetes") ? 170 : 230,
      mood,
      groceries,
      weight: parseInt(weight),
      activity
    };

    try {
      const res = await fetch(`${API_URL}/meal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.meal) {
        setMeal(result.meal);
        setWater(result.water_intake_liters || "N/A");
        setHistory([]);
        setError("");
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/history`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
      setMeal("");
    } catch (err) {
      setError("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <div style={styles.card}>
          <h2 style={styles.title}>NutriMind AI 🍽️</h2>

          <select style={styles.input} value={bp} onChange={e => setBp(e.target.value)}>
            <option value="">Select BP Range</option>
            {bpOptions.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>

          <select style={styles.input} value={sugar} onChange={e => setSugar(e.target.value)}>
            <option value="">Select Sugar Level</option>
            {sugarOptions.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>

          {/* New Mood Dropdown */}
          <select style={styles.input} value={mood} onChange={e => setMood(e.target.value)}>
            <option value="">Select Your Mood</option>
            {moodOptions.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>

          <input 
            style={styles.input} 
            placeholder="Available Groceries (e.g. rice, dal, paneer, vegetables, chicken...)" 
            value={groceries}
            onChange={e => setGroceries(e.target.value)} 
          />

          <input 
            style={styles.input} 
            placeholder="Weight (kg)" 
            value={weight}
            onChange={e => setWeight(e.target.value)} 
          />

          <select style={styles.input} value={activity} onChange={e => setActivity(e.target.value)}>
            <option value="low">Low Activity</option>
            <option value="moderate">Moderate Activity</option>
            <option value="high">High Activity</option>
          </select>

          <div style={styles.buttonGroup}>
            <button 
              style={styles.button} 
              onClick={getMeal} 
              disabled={loading}
            >
              {loading ? "Getting Meal..." : "Get Healthy Meal"}
            </button>
            <button 
              style={styles.buttonAlt} 
              onClick={getHistory} 
              disabled={loading}
            >
              View History
            </button>
          </div>

          {error && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</p>}
        </div>

        {/* Meal Result */}
        {meal && (
          <div style={styles.resultCard}>
            <h3>🍽️ Recommended Healthy Indian Meal</h3>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", fontSize: "15.5px" }}>
              {meal}
            </div>
            <h4 style={{ marginTop: "18px", color: "#27ae60" }}>
              💧 Recommended Water Intake: {water} Liters/day
            </h4>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div style={styles.historyContainer}>
            <h3 style={{ color: "white", textAlign: "center", marginBottom: "15px" }}>Your Past Entries</h3>
            {history.map((item, index) => (
              <div key={index} style={styles.historyCard}>
                <h4>📅 {item.date}</h4>
                <p>🩺 BP: {item.bp} | 🍬 Sugar: {item.sugar}</p>
                <p>😊 Mood: {item.mood}</p>
                <p>🍽️ Meal: {item.meal}</p>
                <p>💧 Water: {item.water} L</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundImage: "url('https://images.unsplash.com/photo-1498837167922-ddd27525d352')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed"
  },
  overlay: {
    minHeight: "100vh",
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: "30px 20px"
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    width: "380px",
    margin: "0 auto",
    boxShadow: "0 15px 35px rgba(0,0,0,0.4)"
  },
  title: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#2c3e50",
    fontSize: "28px"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "15px"
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "20px"
  },
  button: {
    flex: 1,
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  buttonAlt: {
    flex: 1,
    background: "#2ecc71",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  resultCard: {
    background: "white",
    marginTop: "25px",
    padding: "25px",
    borderRadius: "20px",
    width: "380px",
    marginLeft: "auto",
    marginRight: "auto",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  },
  historyContainer: {
    marginTop: "30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px"
  },
  historyCard: {
    background: "white",
    padding: "18px",
    borderRadius: "15px",
    width: "380px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
  }
};

export default App;