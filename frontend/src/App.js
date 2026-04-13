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
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const API_URL = "https://nutrimindai-kaoo.onrender.com";

  // BP and Sugar options
  const bpOptions = ["90-120", "120-140", "140-160", "160+"];
  const sugarOptions = ["Normal (<140)", "Prediabetes (140-199)", "High (>=200)"];

  const getMeal = async () => {
    if (!bp || !sugar || !mood || !groceries || !weight) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    const data = {
      bp: parseInt(bp.split("-")[0]) || 120, // take first number
      sugar: sugar.includes("Normal") ? 100 : sugar.includes("Prediabetes") ? 160 : 220,
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
    } finally {
      setLoading(false);
    }
  };

  // Simple Login with OTP simulation
  const sendOtp = () => {
    if (!email) {
      setError("Please enter email");
      return;
    }
    alert(`OTP sent to ${email} (Simulation - In real app we would send actual OTP)`);
    // In real app, call backend to send OTP
  };

  const verifyOtp = () => {
    if (otp === "1234") { // Simulation
      setIsLoggedIn(true);
      setShowLogin(false);
      setError("");
      alert("Login successful! 🎉");
    } else {
      setError("Invalid OTP. Try 1234 for demo");
    }
  };

  if (showLogin) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h2>Login to NutriMind AI</h2>
          <input
            style={styles.input}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button style={styles.button} onClick={sendOtp}>
            Send OTP
          </button>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter OTP (demo: 1234)"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button style={styles.button} onClick={verifyOtp}>
            Verify OTP
          </button>
          <button style={styles.buttonAlt} onClick={() => setShowLogin(false)}>
            Cancel
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        {!isLoggedIn && (
          <button style={styles.loginBtn} onClick={() => setShowLogin(true)}>
            Login
          </button>
        )}

        <div style={styles.card}>
          <h2 style={styles.title}>NutriMind AI 🍽️</h2>

          <select style={styles.input} value={bp} onChange={e => setBp(e.target.value)}>
            <option value="">Select BP Range</option>
            {bpOptions.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>

          <select style={styles.input} value={sugar} onChange={e => setSugar(e.target.value)}>
            <option value="">Select Sugar Level</option>
            {sugarOptions.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>

          <input style={styles.input} placeholder="Current Mood" value={mood} onChange={e => setMood(e.target.value)} />
          <input style={styles.input} placeholder="Available Groceries (e.g. rice, dal, vegetables)" value={groceries} onChange={e => setGroceries(e.target.value)} />
          <input style={styles.input} placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} />

          <select style={styles.input} value={activity} onChange={e => setActivity(e.target.value)}>
            <option value="low">Low Activity</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>

          <div style={styles.buttonGroup}>
            <button style={styles.button} onClick={getMeal} disabled={loading}>
              {loading ? "Thinking..." : "Get Healthy Meal"}
            </button>
            <button style={styles.buttonAlt} onClick={getHistory} disabled={loading}>
              View History
            </button>
          </div>

          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        </div>

        {meal && (
          <div style={styles.resultCard}>
            <h3>🍽️ Recommended Meal</h3>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{meal}</div>
            <h4>💧 Recommended Water Intake: {water} Liters/day</h4>
          </div>
        )}

        {history.length > 0 && (
          <div style={styles.historyContainer}>
            <h3>Your History</h3>
            {history.map((item, index) => (
              <div key={index} style={styles.historyCard}>
                <h4>📅 {item.date}</h4>
                <p>BP: {item.bp} | Sugar: {item.sugar}</p>
                <p>Mood: {item.mood}</p>
                <p>Meal: {item.meal}</p>
                <p>Water: {item.water} L</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Keep your existing styles or improve them if you want
const styles = { /* ... your existing styles ... */ };

export default App;