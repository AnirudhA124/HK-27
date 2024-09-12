// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Firebase configuration
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
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Function to save user data to Firestore
async function saveUserData(user) {
  try {
    // Create a document in Firestore under the 'users' collection with the user's UID
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      uid: user.uid,
      displayName: user.displayName || "Anonymous", // If using Google login, displayName may be available
      lastLogin: new Date().toISOString()
    });
    console.log("User data saved successfully to Firestore");
  } catch (error) {
    console.error("Error saving user data:", error);
  }
}

// Redirect user to a specified link after login
function redirectToDashboard() {
  window.location.href = '../landing_page/index.html'; // Change '/dashboard' to the URL you want to redirect the user to
}

// Email/Password login function
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // Save user data to Firestore
      saveUserData(user);
      console.log("User logged in:", user.uid);
      redirectToDashboard(); // Redirect after successful login
    })
    .catch((error) => {
      console.error("Error logging in with email and password:", error);
      // Optionally, handle error silently here
    });
}

// Google login function
export function googleLogin() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider)
      .then((result) => {
        if (result && result.user) {
          const user = result.user;
          // Save user data to Firestore
          saveUserData(user);
          console.log("User logged in with Google:", user.uid);
          redirectToDashboard(); // Redirect after successful login
        } else {
          console.error("No user data returned from Google login.");
        }
      })
      .catch((error) => {
        console.error("Error with Google login:", error);
        // Optionally, handle error silently here
      });
  }
  

// Log the current authentication state
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user.uid);
  } else {
    console.log("No user is signed in.");
  }
});
