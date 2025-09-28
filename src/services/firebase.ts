// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAcQVPG0sdTM-ka2U0zK0FQnJjm0_Qj-gA",
  authDomain: "ai-fitness-4f11f.firebaseapp.com",
  projectId: "ai-fitness-4f11f",
  storageBucket: "ai-fitness-4f11f.firebasestorage.app",
  messagingSenderId: "798680000267",
  appId: "1:798680000267:web:ef0e09cc30b80b0594240e",
  measurementId: "G-KBKSQD1RKZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
