import { auth, db, doc, getDoc, googleProvider, signInWithPopup, signInWithEmailAndPassword } from "./firebase-config.js";

// EMAIL + PASSWORD LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const button = e.target.querySelector('button[type="submit"]');

  try {
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Signing In...';

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      alert("Please verify your email address before logging in. Check your inbox.");
      button.disabled = false;
      button.innerText = "Sign In";
      return;
    }

    console.log("Logged in:", user);

    // Check if user has a profile
    // Use the shared 'db' instance imported from config
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "complete-profile.html";
    }

  } catch (error) {
    console.error("Login Error:", error);
    let msg = "Login failed.";
    if (error.code === 'auth/invalid-credential') msg = "Invalid email or password.";
    alert(msg);
    button.disabled = false;
    button.innerText = "Sign In";
  }
});

// GOOGLE LOGIN
const googleBtn = document.getElementById("googleLoginBtn");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Login Success:", result.user);

      const docRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = "complete-profile.html";
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("Google Login failed: " + error.message);
    }
  });
}
