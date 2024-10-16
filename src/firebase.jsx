// src/firebase.js

// Gerekli Firebase SDK'larını içe aktarın
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore'u içe aktarın
import { getAnalytics } from "firebase/analytics";

// Firebase yapılandırma bilgilerinizi buraya ekleyin
const firebaseConfig = {
  apiKey: "AIzaSyBAfUdewYRDpgqtD9WigAzjtY5HYvhYkcE",
  authDomain: "rimedraviolin.firebaseapp.com",
  projectId: "rimedraviolin",
  storageBucket: "rimedraviolin.appspot.com",
  messagingSenderId: "735542970408",
  appId: "1:735542970408:web:a47aa60b2bb76b43d34d1d",
  measurementId: "G-W4902BLHNM"
};

// Firebase'i başlatın
const app = initializeApp(firebaseConfig);

// Analytics'i başlatın
const analytics = getAnalytics(app);

// Authentication'ı başlatın ve dışa aktarın
export const auth = getAuth(app);

// Firestore'u başlatın ve dışa aktarın
export const db = getFirestore(app);
