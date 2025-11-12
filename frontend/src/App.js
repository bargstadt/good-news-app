import React, { useState } from "react";
import { fetchGoodNews } from "./firebase";

function App() {
  const [scope, setScope] = useState("world");
  const [lens, setLens] = useState("Gospel");
  const [timeframe, setTimeframe] = useState("day");
  const [location, setLocation] = useState("");
  const [output, setOutput] = useState("");

  const handleFetchGoodNews = async () => {
    // Validate local news input
    if (scope === "local" && !location.trim()) {
      setOutput("Please enter a city/state for local news.");
      return;
    }

    setOutput("Loading...");
    const params = { scope, lens, timeframe };
    if (scope === "local") params.location = location.trim();

    try {
      const result = await fetchGoodNews(params);
      // Extract the string message instead of assigning the whole object
      setOutput(result.message);
    } catch (err) {
      console.error("Error calling getGoodNews:", err);
      setOutput(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 600 }}>
      <h1>Good News</h1>
      <p>See today’s news through the lens of sacred texts.</p>

      <label>
        Scope:
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          style={{ marginLeft: "0.5rem" }}
        >
          <option value="local">Local</option>
          <option value="us">US</option>
          <option value="world">World</option>
        </select>
      </label>

      {scope === "local" && (
        <div style={{ marginTop: "1rem" }}>
          <label>
            City / State:
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Austin, TX"
              style={{
                marginLeft: "0.5rem",
                padding: "0.25rem",
                borderRadius: "0.25rem",
                border: "1px solid #ccc",
              }}
            />
          </label>
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <label>
          Lens:
          <select
            value={lens}
            onChange={(e) => setLens(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="Gospel">Gospel</option>
            <option value="Torah">Torah</option>
            <option value="Hindu texts">Hindu texts</option>
            <option value="Quran">Quran</option>
            <option value="Dhammapada">Dhammapada</option>
            <option value="Guru Granth Sahib">Guru Granth Sahib</option>
            <option value="Tao Te Ching">Tao Te Ching</option>
            <option value="Avesta">Avesta</option>
            <option value="Book of Mormon">Book of Mormon</option>
            <option value="Analects">Analects</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>
          Timeframe:
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={handleFetchGoodNews}
          style={{
            padding: "0.5rem 1rem",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Get Good News
        </button>
      </div>

      <pre style={{ marginTop: "2rem", whiteSpace: "pre-wrap" }}>{output}</pre>
    </div>
  );
}

export default App;
