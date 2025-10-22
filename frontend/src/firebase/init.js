import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6xEW5Ofs3VpQwHaCGoses_nwaundMRLg",
  authDomain: "fit5032-week6-da697.firebaseapp.com",
  projectId: "fit5032-week6-da697",
  storageBucket: "fit5032-week6-da697.firebasestorage.app",
  messagingSenderId: "1311900713",
  appId: "1:1311900713:web:f5a3f0a1e5b812ca5c8838",
  measurementId: "G-NTVX0ERKZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;