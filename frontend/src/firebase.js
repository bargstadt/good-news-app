import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

/**
 * Streams Good News GPT response from Firebase HTTP function.
 * @param {Object} payload - { scope, lens, timeframe, location? }
 * @param {function} onChunk - callback for each GPT delta chunk
 */
export const fetchGoodNewsStream = (payload, onChunk) => {
  const url = "https://getgoodnewshttp-2g3ysd6tza-uc.a.run.app";

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const read = async () => {
        const { done, value } = await reader.read();
        if (done) return;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (line.startsWith("data:")) {
            const jsonStr = line.replace(/^data: /, "");
            if (jsonStr.trim()) {
              try {
                const chunk = JSON.parse(jsonStr);
                onChunk(chunk);
              } catch (err) {
                console.error("Error parsing chunk:", err);
              }
            }
          }
        }

        buffer = lines[lines.length - 1]; // leftover for next read
        read();
      };

      read();
    })
    .catch((err) => console.error("Streaming error:", err));
};

export { functions };
