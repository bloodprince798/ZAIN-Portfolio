// Create stars and shooting stars
document.addEventListener('DOMContentLoaded', function() {
  createStars();
  createShootingStars();
  setupMobileMenu();
  setupFormValidation();
  setupScrollAnimations();
});

function createStars() {
  const starsContainer = document.getElementById('starsContainer');
  const starCount = 150;
  
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    
    // Random properties for each star
    const size = Math.random() * 3;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const duration = 3 + Math.random() * 7;
    const delay = Math.random() * 5;
    
    star.style.width = ${size}px;
    star.style.height = ${size}px;
    star.style.left = ${left}%;
    star.style.top = ${top}%;
    star.style.animationDelay = ${delay}s;
    star.style.animationDuration = ${duration}s;
    
    starsContainer.appendChild(star);
  }
}

function createShootingStars() {
  const starsContainer = document.getElementById('starsContainer');
  const shootingStarCount = 5;
  
  for (let i = 0; i < shootingStarCount; i++) {
    const shootingStar = document.createElement('div');
    shootingStar.classList.add('shooting-star');
    
    // Random properties for each shooting star
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 20;
    const duration = 1 + Math.random() * 2;
    
    shootingStar.style.left = ${left}%;
    shootingStar.style.top = ${top}%;
    shootingStar.style.animation = shoot ${duration}s linear ${delay}s infinite;
    
    starsContainer.appendChild(shootingStar);
  }
}

function setupMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (!menuToggle || !navLinks) return;
  
  menuToggle.addEventListener('click', function() {
    navLinks.classList.toggle('active');
    
    // Animate hamburger to X
    const spans = menuToggle.querySelectorAll('span');
    if (navLinks.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });
  
  // Close menu when clicking on a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const spans = menuToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });
}

function setupFormValidation() {
  const contactForm = document.getElementById('contactForm');
  
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Simple form validation
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    if (name && email && message) {
      // Add success animation
      const button = contactForm.querySelector('button');
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
      button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
        contactForm.reset();
      }, 3000);
    } else {
      alert('Please fill in all fields.');
    }
  });
}

function setupScrollAnimations() {
  // Add scroll effect to header
  window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (!header) return;
    
    if (window.scrollY > 100) {
      header.style.background = 'rgba(2, 6, 23, 0.98)';
      header.style.padding = '0.7rem 2rem';
    } else {
      header.style.background = 'rgba(2, 6, 23, 0.95)';
      header.style.padding = '1rem 2rem';
    }
  });
  
  // Intersection Observer for section animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = fadeInUp 0.8s ease forwards;
      }
    });
  }, observerOptions);

  // Observe all sections
  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
}});
});
