// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSryQgksBQfXydeRsJgGUiuQUoraomp3A",
  authDomain: "babieca-factory.firebaseapp.com",
  projectId: "babieca-factory",
  storageBucket: "babieca-factory.firebasestorage.app",
  messagingSenderId: "345232802879",
  appId: "1:345232802879:web:9eefda49561042f778648a",
  measurementId: "G-H47S8NP435"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, analytics };
export default app;