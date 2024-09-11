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
    var pricingSection = document.getElementById('pricing');
    var pricingLink = document.getElementById('pricing-link');
    var sectionPosition = pricingSection.getBoundingClientRect();

    if (sectionPosition.top <= window.innerHeight / 2 && sectionPosition.bottom >= window.innerHeight / 4) {
        pricingLink.classList.add('text-blue-500'); // Change to your desired color class
    } else {
        pricingLink.classList.remove('text-blue-500');
    }
    var aboutusSection = document.getElementById('aboutus');
    var aboutusLink = document.getElementById('aboutus-link');
    var sectionPosition1 = aboutusSection.getBoundingClientRect();

    if (sectionPosition1.top <= window.innerHeight / 2 && sectionPosition1.bottom >= window.innerHeight / 2) {
        aboutusLink.classList.add('text-blue-500'); // Change to your desired color class
    } else {
        aboutusLink.classList.remove('text-blue-500');
    }
    var aboutusSection = document.getElementById('features');
    var aboutusLink = document.getElementById('features-link');
    var sectionPosition1 = aboutusSection.getBoundingClientRect();

    if (sectionPosition1.top <= window.innerHeight / 2 && sectionPosition1.bottom >= window.innerHeight / 2) {
        aboutusLink.classList.add('text-blue-500'); // Change to your desired color class
    } else {
        aboutusLink.classList.remove('text-blue-500');
    }
    var aboutusSection = document.getElementById('landing');
    var aboutusLink = document.getElementById('landing-link');
    var sectionPosition1 = aboutusSection.getBoundingClientRect();

    if (sectionPosition1.top <= window.innerHeight / 2 && sectionPosition1.bottom >= window.innerHeight / 2) {
        aboutusLink.classList.add('text-blue-500'); // Change to your desired color class
    } else {
        aboutusLink.classList.remove('text-blue-500');
    }
   
});
