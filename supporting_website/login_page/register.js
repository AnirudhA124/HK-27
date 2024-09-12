// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACxd_4C8-ZMIRL080xJdPy6kLN8bJP6Uk",
    authDomain: "octavian-ai.firebaseapp.com",
    projectId: "octavian-ai",
    storageBucket: "octavian-ai.appspot.com",
    messagingSenderId: "546397273278",
    appId: "1:546397273278:web:103f1372eecc85778f32ef",
    measurementId: "G-FKZYG3QMK9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase initialized");

// Function to handle email/password registration
async function registerWithEmailPassword(email, password, displayName) {
    console.log("Attempting to register with email and password");
    try {
        // Check if email is already in use
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if username already exists in Firestore
        const usernameSnapshot = await getDoc(doc(db, "usernames", displayName));
        if (usernameSnapshot.exists()) {
            throw new Error("Username is already taken.");
        }

        // Store additional user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            displayName: displayName,
            createdAt: new Date()
        });

        // Store the username to ensure uniqueness
        await setDoc(doc(db, "usernames", displayName), {
            uid: user.uid
        });

        console.log("User registered successfully:", user);
        alert("Registration successful!");
        // Redirect to login page or dashboard
        window.location.href = "login.html";
    } catch (error) {
        console.error("Error registering user:", error);
        alert("Error registering user: " + error.message);
    }
}

// Function to handle Google Sign-In
async function registerWithGoogle() {
    console.log("Attempting to register with Google");
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Store additional user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: user.displayName,
            createdAt: new Date()
        });

        console.log("User registered with Google successfully:", user);
        alert("Google registration successful!");
        // Redirect to dashboard or home page
        window.location.href = "dashboard.html";
    } catch (error) {
        if (error.code === 'auth/popup-closed-by-user') {
            console.log("Popup was closed by the user.");
            alert("Sign-in popup was closed. Please try again.");
        } else {
            console.error("Error registering with Google:", error);
            alert("Error registering with Google: " + error.message);
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content loaded");
    const registerBtn = document.getElementById('registerBtn');
    const googleBtn = document.getElementById('googleSignInBtn');

    if (registerBtn) {
        console.log("Register button found");
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const displayName = document.getElementById('displayName').value;
            registerWithEmailPassword(email, password, displayName);
        });
    } else {
        console.error("Register button not found");
    }

    if (googleBtn) {
        console.log("Google sign-in button found");
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerWithGoogle();
        });
    } else {
        console.error("Google sign-in button not found");
    }
});

console.log("register.js loaded");
