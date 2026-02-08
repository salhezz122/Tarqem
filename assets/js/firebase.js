// Firebase SDKs (Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

// 🔑 Firebase configuration (من Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCtVmD12uHz-JFAcPv5EpwDVKdSvaslzAo",
  authDomain: "amman-factcheck.firebaseapp.com",
  projectId: "amman-factcheck",
  storageBucket: "amman-factcheck.appspot.com", // ✅ الصحيح
  messagingSenderId: "515492556687",
  appId: "1:515492556687:web:7526dc7b3e0ecc74d2a5fa",
  measurementId: "G-YZC81SSMDN"
};

// 🔥 Initialize Firebase (مرة وحدة فقط)
export const app = initializeApp(firebaseConfig);

// 🔐 Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
