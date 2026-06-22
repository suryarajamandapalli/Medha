import { auth, db, doc, setDoc, onAuthStateChanged } from "./firebase-config.js";

// Check connectivity and auth status
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User detected for profile completion:", user.uid);
        // Pre-fill name if available (e.g. from Google)
        if (user.displayName) {
            document.getElementById('profileName').value = user.displayName;
        }
    } else {
        // No user -> Redirect to login
        console.warn("No user found. Redirecting to login.");
        window.location.href = 'login.html';
    }
});

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to save your profile.");
        return;
    }

    const fullName = document.getElementById('profileName').value;
    const age = document.getElementById('profileAge').value;
    const studentClass = document.getElementById('profileClass').value;

    // Get selected goal
    const selectedGoal = document.querySelector('input[name="goal"]:checked')?.value || 'general';

    const button = e.target.querySelector('button[type="submit"]');

    try {
        button.disabled = true;
        button.innerText = 'Saving...';

        // Save to Firestore
        // Collection: users, Document ID: uid
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: fullName,
            age: parseInt(age),
            studentClass: studentClass,
            primaryGoal: selectedGoal,
            createdAt: new Date().toISOString(),
            onboardingCompleted: true
        }, { merge: true }); // Merge checks if doc exists

        console.log("Profile saved!");
        // Redirect to Dashboard (create placeholder if needed)
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Error saving profile: " + error.message);
        button.disabled = false;
        button.innerText = 'Complete Profile';
    }
});
