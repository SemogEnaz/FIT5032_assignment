import { createApp } from 'vue'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import router from './router';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
initializeApp(firebaseConfig);

createApp(App).use(router).mount('#app')
