// Firebase v9+ Modular SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    increment,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔐 Your Firebase configuration (REAL – from Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyCB7F9NCYA8eWs4JVXkRGU71LUrl20hpdw",
    authDomain: "medha-24fd9.firebaseapp.com",
    projectId: "medha-24fd9",
    storageBucket: "medha-24fd9.firebasestorage.app",
    messagingSenderId: "1002971984219",
    appId: "1:1002971984219:web:007a2c05cd8ec6e2962a7e"
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

console.log("Firebase initialized successfully (ES Module)");

// Export services and functions for use in other modules
export {
    auth,
    db,
    googleProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
    signOut,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    increment,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    arrayUnion
};
