// Smooth scrolling for navigation
var navLinks = document.querySelectorAll('.nav-links a');

for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        var targetId = this.getAttribute('href');
        var targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 50,
                behavior: 'smooth'
            });
        }
    });
}

// Contact Form Handling
var contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form values
        var name = document.getElementById('name').value;
        var email = document.getElementById('email').value;
        var message = document.getElementById('message').value;
        
        // Simple validation
        if (name === '' || email === '' || message === '') {
            alert('Please fill in all fields.');
            return;
        }
        
        // Email validation
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Show success message
        alert('Thank you ' + name + '! I will contact you soon at ' + email + ' . Tell Us About Your First Experience');
        
        // Reset form
        contactForm.reset();
    });
}

// Navbar background change on scroll
window.addEventListener('scroll', function() {
    var header = document.querySelector('header');
    
});

// Skills hover effect
var skillItems = document.querySelectorAll('.skills-box span');

for (var i = 0; i < skillItems.length; i++) {
    skillItems[i].addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.1)';
       
    });
    
    skillItems[i].addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
       
    });
}

// Project cards hover effect
var projectCards = document.querySelectorAll('.project-card');

for (var i = 0; i < projectCards.length; i++) {
    projectCards[i].addEventListener('mouseover', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    projectCards[i].addEventListener('mouseout', function() {
        this.style.transform = 'translateY(0)';
    });
}

// Update footer year automatically
window.addEventListener('load', function() {
    var footer = document.querySelector('footer p');
    if (footer) {
        var currentYear = new Date().getFullYear();
        footer.innerHTML = '© ' + currentYear + ' Zain | All Rights Reserved';
    }
});

// Simple loading effect
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s';
    
    setTimeout(function() {
        document.body.style.opacity = '1';
    }, 100);
});

// Contact links hover effect
var contactLinks = document.querySelectorAll('.contact-link');

for (var i = 0; i < contactLinks.length; i++) {
    contactLinks[i].addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    contactLinks[i].addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
}

// Button click effect
var buttons = document.querySelectorAll('.btn');

for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(function() {
            this.style.transform = 'scale(1)';
        }.bind(this),150);});
}
