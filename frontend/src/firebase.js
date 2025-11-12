// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALqvd9yeHQfsq_kRvcl_ZU6-97XKQb1bA",
  authDomain: "newagent-9f3d5.firebaseapp.com",
  databaseURL: "https://newagent-9f3d5.firebaseio.com",
  projectId: "newagent-9f3d5",
  storageBucket: "newagent-9f3d5.firebasestorage.app",
  messagingSenderId: "70737908083",
  appId: "1:70737908083:web:fb600fe388d31bb3e97506"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, "us-central1");

// Automatically connect to emulator in development
if (process.env.NODE_ENV === "development") {
  console.log("Connecting to local Firebase Functions emulator...");
  connectFunctionsEmulator(functions, "localhost", 5001);
}
// https://us-central1-newagent-9f3d5.cloudfunctions.net/getGoodNews
/**
 * Calls the getGoodNews Firebase function
 * @param {Object} params - { scope, lens, timeframe, location? }
 * @returns {Promise<string>} AI-generated message
 */
export const fetchGoodNews = async (params) => {
  const getGoodNews = httpsCallable(functions, "getGoodNews");
  try {
    const result = await getGoodNews(params);
    console.log("Firebase callable result:", result);
    return result.data.message;
  } catch (error) {
    console.error("Firebase callable error:", error);

    if (process.env.NODE_ENV === "development") {
      return `Error fetching good news: ${error?.message || JSON.stringify(error)}`;
    }

    return "Error fetching good news.";
  }
};

export { functions };
