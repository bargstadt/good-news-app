// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
// import { connectFunctionsEmulator } from "firebase/functions";



// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Functions (deployed functions only)
const functions = getFunctions(app);
const hostname = window.location.hostname;
console.log("Hostname is:", hostname);

// if (hostname === "localhost") {
//   console.log("Connecting to Functions emulator...");
//   connectFunctionsEmulator(functions, "127.0.0.1", 5001);
//   console.log("Connected to emulator!");
// } else {
//   console.log("Running in production mode.");
// }
/**
 * Calls the getGoodNews Firebase onCall function
 * @param {Object} payload - { scope, lens, timeframe, location? }
 * @returns {Promise<any>} Function result
 */
export const fetchGoodNews = async (payload) => {
  try {
    const callable = httpsCallable(functions, "getGoodNews");
    const result = await callable(payload);
    console.log("getGoodNews result:", result.data);
    return result.data;
  } catch (err) {
    console.error("Error calling getGoodNews:", err);
    throw err;
  }
};

export { functions };
