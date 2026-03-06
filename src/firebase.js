// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAmGcBj95NvyQgwOGSoxM3FFaSHyi58m3U",
    authDomain: "cyberbase-85a60.firebaseapp.com",
    projectId: "cyberbase-85a60",
    storageBucket: "cyberbase-85a60.firebasestorage.app",
    messagingSenderId: "124500318953",
    appId: "1:124500318953:web:e11d3c90c9fe5cf2f42e78",
    measurementId: "G-PLCR8BLL9T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics (only in browser)
let analytics = null;
if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
export default app;
