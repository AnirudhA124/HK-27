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


const featureDivs = [
    document.getElementById('pdf'),
    document.getElementById('url'),
    document.getElementById('mom'),
    document.getElementById('video'),
    document.getElementById('snip')
];
const image = document.getElementById('img');

// Add hover event listeners for each feature div
featureDivs.forEach((div) => {
    if (div) { // Check if the div exists
        div.addEventListener('mouseover', () => {
            const newImageSrc = div.dataset.image; // Get the image source from data-image attribute
            if (image.src !== newImageSrc) {
                image.style.opacity = '0'; // Fade out the current image
                setTimeout(() => {
                    image.src = newImageSrc; // Change the image source
                    image.style.opacity = '1'; // Fade in the new image
                }, 300);
            }
        });

        // Optional: If you want to hide the image when the mouse leaves the div
        div.addEventListener('mouseleave', () => {
            image.style.opacity = '0'; // Fade out the image when mouse leaves
        });
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