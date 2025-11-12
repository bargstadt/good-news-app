import React, { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export default function GoodNews() {
  const [news, setNews] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const getGoodNews = httpsCallable(functions, "getGoodNews");
      const result = await getGoodNews({
        scope: "world",      // "local", "national", "world"
        scripture: "Gospel", // or any scripture
        period: "day",       // "day", "week", "month", "year"
      });
      setNews(result.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch news.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Good News</h1>
      <button onClick={fetchNews} disabled={loading}>
        {loading ? "Loading..." : "Get Good News"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {news && <div style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>{news}</div>}
    </div>
  );
}
