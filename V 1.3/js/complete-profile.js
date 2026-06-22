import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔐 Firebase config (same as before)
const firebaseConfig = {
    apiKey: "AIzaSyCB7F9NCYA8eWs4JVXkRGU71LUrl20hpdw",
    authDomain: "medha-24fd9.firebaseapp.com",
    projectId: "medha-24fd9",
    storageBucket: "medha-24fd9.firebasestorage.app",
    messagingSenderId: "1002971984219",
    appId: "1:1002971984219:web:007a2c05cd8ec6e2962a7e"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🚨 Protect page: only logged-in users
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        // Check if already completed
        const docRef = doc(db, "users", user.uid);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                window.location.href = "dashboard.html";
            }
        });
    }
});

// FORM SUBMIT
document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    const name = document.getElementById("profileName").value;
    const age = parseInt(document.getElementById("profileAge").value);
    const userClass = document.getElementById("profileClass").value;
    const goal = document.querySelector('input[name="goal"]:checked')?.value;
    const learningPace = document.getElementById("learningPace").value;
    const dailyTime = document.getElementById("dailyTime").value;
    const challengeStyle = document.getElementById("challengeStyle").value;
    const motivationType = document.getElementById("motivationType").value;


    if (!goal) {
        alert("Please select a primary goal.");
        return;
    }

    try {
        // Save to Firestore
        await setDoc(doc(db, "users", user.uid), {
            name,
            age,
            class: userClass,
            goal,
            learningPace,
            dailyTime,
            challengeStyle,
            motivationType,
            email: user.email,
            createdAt: serverTimestamp()
        });




        console.log("Profile saved");
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Profile save error:", error);
        alert("Something went wrong. Please try again.");
    }
});
