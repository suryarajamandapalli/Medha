import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification } from "./firebase-config.js";

// EMAIL SIGNUP
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // We will capture Full Name in the next step (Complete Profile settings) or update profile here
    // For now, let's focus on creating the auth user
    const button = e.target.querySelector('button[type="submit"]');

    // Basic Validation
    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    try {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Creating...';

        // 1. Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Send Verification Email
        await sendEmailVerification(user);

        // 3. Redirect
        console.log("User created:", user);
        window.location.href = 'verify-email.html';

    } catch (error) {
        console.error("Signup Error:", error);
        let msg = error.message;
        if (error.code === 'auth/email-already-in-use') msg = "This email is already registered.";
        alert(msg);
        button.disabled = false;
        button.innerText = 'Create Account';
    }
});

// Google Signup
const googleBtn = document.getElementById('googleSignupBtn');
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // On success, redirect to profile completion
            window.location.href = 'complete-profile.html';
        } catch (error) {
            console.error("Google Auth Error:", error);
            alert(error.message);
        }
    });
}
