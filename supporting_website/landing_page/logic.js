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
