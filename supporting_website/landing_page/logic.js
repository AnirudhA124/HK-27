// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

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

// Function to update the login/logout button
function updateAuthButton(user) {
    const authButton = document.getElementById('authButton');
    if (user) {
        authButton.textContent = 'Logout';
        authButton.href = '#';
        authButton.onclick = () => signOut(auth);
    } else {
        authButton.textContent = 'Login';
        authButton.href = '../login_page/login.html';
        authButton.onclick = null;
    }
}

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    updateAuthButton(user);
});

const scrollDiv = document.getElementById('pdf');
const image = document.getElementById('img');

scrollDiv.addEventListener('scroll', function() {
    if (scrollDiv.scrollTop > 100) {
        image.src = 'landing_page/pdf-file.png';
    } else {
        image.src = 'back';
    }
});

window.addEventListener('scroll', function() {
    const sections = ['pricing', 'aboutus', 'features', 'landing'];
    const links = ['pricing-link', 'aboutus-link', 'features-link', 'landing-link'];
    
    sections.forEach((sectionId, index) => {
        const section = document.getElementById(sectionId);
        const link = document.getElementById(links[index]);
        const sectionPosition = section.getBoundingClientRect();
        
        if (sectionPosition.top <= window.innerHeight / 2 && sectionPosition.bottom >= window.innerHeight / 2) {
            link.classList.add('text-blue-500'); // Change to your desired color class
        } else {
            link.classList.remove('text-blue-500');
        }
    });
});

// Smooth scroll to section when link is clicked
document.querySelectorAll('[data-scroll]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1); // Remove '#' from href
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});