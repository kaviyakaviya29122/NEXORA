console.log("ADMIN JS LOADED");
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const loginForm = document.getElementById("admin-login-form");
const message = document.getElementById("login-message");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Authentication works, but admin authorization
      // must be configured before allowing admin actions.
     message.textContent =
  "Login successful! Redirecting to admin dashboard...";

window.location.href = "./admin-dashboard.html";


    } catch (error) {
      console.error("Admin login failed:", error);
      message.textContent =
        "Login failed. Please check your email and password.";
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Signed in user:", user.email);
  } else {
    console.log("No user signed in.");
  }
});
