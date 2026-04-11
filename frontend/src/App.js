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

  const getMeal = async () => {
    if (!bp || !sugar || !mood || !groceries || !weight) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    const data = {
      bp: parseInt(bp),
      sugar: parseInt(sugar),
      mood,
      groceries,
      weight: parseInt(weight),
      activity
    };

    try {
      const res = await fetch(`${API_URL}/meal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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

      if (Array.isArray(data)) {
        setHistory(data);
        setMeal("");
      } else {
        setHistory([]);
        setError("No history available yet");
      }
    } catch (err) {
      setError("Failed to load history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <div style={styles.card}>
          <h2 style={styles.title}>NutriMind AI 🍽️</h2>

          <input 
            style={styles.input} 
            placeholder="BP (mmHg)" 
            value={bp}
            onChange={e => setBp(e.target.value)} 
          />
          <input 
            style={styles.input} 
            placeholder="Sugar (mg/dL)" 
            value={sugar}
            onChange={e => setSugar(e.target.value)} 
          />
          <input 
            style={styles.input} 
            placeholder="Mood" 
            value={mood}
            onChange={e => setMood(e.target.value)} 
          />
          <input 
            style={styles.input} 
            placeholder="Available Groceries" 
            value={groceries}
            onChange={e => setGroceries(e.target.value)} 
          />
          <input 
            style={styles.input} 
            placeholder="Weight (kg)" 
            value={weight}
            onChange={e => setWeight(e.target.value)} 
          />

          <select 
            style={styles.input} 
            value={activity}
            onChange={e => setActivity(e.target.value)}
          >
            <option value="low">Low Activity</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>

          <div style={styles.buttonGroup}>
            <button 
              style={styles.button} 
              onClick={getMeal}
              disabled={loading}
            >
              {loading ? "Getting Meal..." : "Get Meal"}
            </button>
            <button 
              style={styles.buttonAlt} 
              onClick={getHistory}
              disabled={loading}
            >
              {loading ? "Loading..." : "History"}
            </button>
          </div>

          {error && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</p>}
        </div>

        {meal && (
          <div style={styles.resultCard}>
            <h3>🍽️ Meal Recommendation</h3>
            <p>{meal}</p>
            <h4>💧 Water Intake: {water} L/day</h4>
          </div>
        )}

        {history.length > 0 && (
          <div style={styles.historyContainer}>
            {history.map((item, index) => (
              <div key={index} style={styles.historyCard}>
                <h4>📅 {item.date || "No date"}</h4>
                <p>🩺 BP: {item.bp} | 🍬 Sugar: {item.sugar}</p>
                <p>😊 Mood: {item.mood}</p>
                <p>🍽️ {item.meal}</p>
                <p>💧 {item.water} L</p>
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
    height: "100vh",
    backgroundImage: "url('https://images.unsplash.com/photo-1498837167922-ddd27525d352')",
    backgroundSize: "cover",
    backgroundPosition: "center"
  },
  overlay: {
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: "20px",
    overflowY: "auto"
  },
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    width: "350px",
    margin: "auto",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
  },
  title: {
    textAlign: "center",
    marginBottom: "15px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px"
  },
  button: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    width: "48%",
    cursor: "pointer",
    fontWeight: "bold"
  },
  buttonAlt: {
    background: "#2ecc71",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    width: "48%",
    cursor: "pointer",
    fontWeight: "bold"
  },
  resultCard: {
    background: "white",
    marginTop: "20px",
    padding: "20px",
    borderRadius: "15px",
    width: "350px",
    marginLeft: "auto",
    marginRight: "auto"
  },
  historyContainer: {
    marginTop: "20px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "15px"
  },
  historyCard: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    width: "250px"
  }
};

export default App;