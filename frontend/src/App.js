// const FUNCTION_URL = "https://getgoodnewshttp-2g3ysd6tza-uc.a.run.app";


import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

// Replace with your deployed Cloud Function URL
const FUNCTION_URL = "https://getgoodnewshttp-2g3ysd6tza-uc.a.run.app";

function App() {
  const [scope, setScope] = useState("world");
  const [lens, setLens] = useState("Gospel");
  const [timeframe, setTimeframe] = useState("day");
  const [location, setLocation] = useState("");
  const [topic, setTopic] = useState(""); // new topic input
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetchGoodNews = async () => {
    if (scope === "local" && !location.trim()) {
      setOutput("Please enter a city/state for local news.");
      return;
    }

    setOutput("");
    setLoading(true);

    const payload = { scope, lens, timeframe };
    if (scope === "local") payload.location = location.trim();
    if (topic.trim()) payload.topic = topic.trim(); // include topic if provided

    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.body) throw new Error("No response body from server");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");

        for (let i = 0; i < chunks.length - 1; i++) {
          const line = chunks[i];
          if (line.startsWith("data:")) {
            const dataStr = line.replace(/^data: /, "").trim();
            if (dataStr && dataStr !== "{}") {
              try {
                const content = JSON.parse(dataStr);
                setOutput((prev) => prev + content);
              } catch {
                // ignore parse errors for empty chunks
              }
            }
          }
        }

        buffer = chunks[chunks.length - 1]; // leftover
      }

    } catch (err) {
      console.error("Error fetching Good News:", err);
      setOutput("Failed to load Good News.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 600 }}>
      <h1>Good News</h1>

      <label>
        Scope:
        <select value={scope} onChange={(e) => setScope(e.target.value)} style={{ marginLeft: 8 }}>
          <option value="local">Local</option>
          <option value="us">US</option>
          <option value="world">World</option>
        </select>
      </label>

      {scope === "local" && (
        <div style={{ marginTop: 8 }}>
          <label>
            City / State:
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Austin, TX"
              style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: "1px solid #ccc" }}
            />
          </label>
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <label>
          Lens:
          <select value={lens} onChange={(e) => setLens(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="Gospel">Gospel</option>
            <option value="Torah">Torah</option>
            <option value="Quran">Quran</option>
            <option value="Hindu texts">Hindu texts</option>
            <option value="Dhammapada">Dhammapada</option>
            <option value="Guru Granth Sahib">Guru Granth Sahib</option>
            <option value="Tao Te Ching">Tao Te Ching</option>
            <option value="Avesta">Avesta</option>
            <option value="Book of Mormon">Book of Mormon</option>
            <option value="Analects">Analects</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <label>
          Timeframe:
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </label>
      </div>

      {/* New topic input */}
      <div style={{ marginTop: 8 }}>
        <label>
          Topic (optional):
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., climate change, tech, sports"
            style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: "1px solid #ccc", width: "60%" }}
          />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          onClick={handleFetchGoodNews}
          disabled={loading}
          style={{
            padding: "6px 12px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Get Good News"}
        </button>
      </div>

      {/* Output */}
      <div
        style={{
          marginTop: 16,
          maxHeight: 400,
          overflowY: "auto",
          padding: 8,
          border: "1px solid #ccc",
          borderRadius: 4,
          backgroundColor: "#f9f9f9",
        }}
      >
        <ReactMarkdown>{output}</ReactMarkdown>
      </div>
    </div>
  );
}

export default App;

