import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD8ZGRYHyElOIbV5aUe7R23u5_R9iiR17E",
  authDomain: "greenpulse-cd4ad.firebaseapp.com",
  databaseURL: "https://greenpulse-cd4ad-default-rtdb.firebaseio.com",
  projectId: "greenpulse-cd4ad",
  storageBucket: "greenpulse-cd4ad.firebasestorage.app",
  messagingSenderId: "971795498498",
  appId: "1:971795498498:web:65e2e7e94e1c24b68db2c3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
