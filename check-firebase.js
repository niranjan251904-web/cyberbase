import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAmGcBj95NvyQgwOGSoxM3FFaSHyi58m3U",
  authDomain: "cyberbase-85a60.firebaseapp.com",
  projectId: "cyberbase-85a60",
  storageBucket: "cyberbase-85a60.firebasestorage.app",
  messagingSenderId: "124500318953",
  appId: "1:124500318953:web:e11d3c90c9fe5cf2f42e78",
  measurementId: "G-PLCR8BLL9T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
  try {
    console.log("Testing Firebase App initialization...");
    console.log("App ID:", app.options.appId);

    console.log("\nTesting Firestore connection...");
    const collRef = collection(db, "_connection_test");
    const docRef = await addDoc(collRef, { test: true, timestamp: new Date() });
    
    console.log("✅ Firestore write successful. Document ID:", docRef.id);
    
    await deleteDoc(docRef);
    console.log("✅ Firestore delete successful. Cleanup done.");
    
    console.log("\n🔥🔥 Firebase connection looks GOOD! 🔥🔥");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Firebase connection FAILED:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
