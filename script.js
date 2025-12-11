// ====================== SIMPLIFIED PORTFOLIO JS ======================

// Website Load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Portfolio Loaded');
    
    // Initialize functions
    setupMobileMenu();
    setupSmoothScroll();
    setupContactForm();
    setupStarsEffect();
    setupHoverEffects();
    updateFooterYear();
    
    // Page load effect
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 300);
});

// ====================== MOBILE MENU ======================
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle) {
        // Create overlay for closing menu
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
        
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        
        // Close menu when clicking overlay
        overlay.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            overlay.classList.remove('active');
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                overlay.classList.remove('active');
            });
        });
        
        // Close menu on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
        
        // Close menu when resizing to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    }
}
// ====================== SMOOTH SCROLL ======================
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                const navLinks = document.getElementById('navLinks');
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    document.getElementById('menuToggle').classList.remove('active');
                }
                
                // Smooth scroll
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ====================== CONTACT FORM ======================
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Validation
        if (!name || !email || !message) {
            showAlert('Please fill all fields!', 'warning');
            return;
        }
        
        if (!isValidEmail(email)) {
            showAlert('Please enter valid email!', 'warning');
            return;
        }
        
        // Show sending state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate sending (replace with EmailJS later)
        setTimeout(() => {
            showAlert('Message sent! I will contact you soon.', 'success');
            
            // Add celebration
            createStarsBurst();
            
            // Reset form
            contactForm.reset();
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Fallback: Open email client
          /*  setTimeout(() => {
                const userEmail = 'bloodprince798@gmail.com';
                const subject = `Message from ${name}`;
                const body = `${message}%0D%0A%0D%0AFrom: ${name}%0D%0AEmail: ${email}`;
                window.location.href = `mailto:${userEmail}?subject=${subject}&body=${body}`;
            }, 1000);*/
            
        }, 1500);
    });
}

// Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Show alert/notification
function showAlert(message, type) {
    // Remove old alert
    const oldAlert = document.querySelector('.alert-message');
    if (oldAlert) oldAlert.remove();
    
    // Create alert
    const alert = document.createElement('div');
    alert.className = `alert-message alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Style alert
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
        color: white;
        font-weight: 600;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: alertSlideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.style.animation = 'alertSlideOut 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
}

// ====================== STARS EFFECT ======================
function setupStarsEffect() {
    // Create stars container
    const starsContainer = document.getElementById('starsContainer') || 
                          (() => {
                              const div = document.createElement('div');
                              div.id = 'starsContainer';
                              div.style.cssText = `
                                  position: fixed;
                                  top: 0;
                                  left: 0;
                                  width: 100%;
                                  height: 100%;
                                  pointer-events: none;
                                  z-index: -1;
                                  overflow: hidden;
                              `;
                              document.body.appendChild(div);
                              return div;
                          })();
    
    // Create background stars
    for (let i = 0; i < 100; i++) {
        createStar(starsContainer);
    }
    
    // Create falling stars every second
    setInterval(() => createFallingStar(starsContainer), 1000);
    
    // Create stars on click
    document.addEventListener('click', (e) => {
        createClickStar(e.clientX, e.clientY);
    });
}

function createStar(container) {
    const star = document.createElement('div');
    star.className = 'star';
    
    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 5;
    
    star.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: white;
        border-radius: 50%;
        left: ${x}vw;
        top: ${y}vh;
        opacity: ${Math.random() * 0.5 + 0.3};
        animation: starTwinkle ${duration}s infinite ${delay}s;
        box-shadow: 0 0 ${size * 2}px white;
    `;
    
    container.appendChild(star);
}

function createFallingStar(container) {
    const star = document.createElement('div');
    star.className = 'falling-star';
    
    const x = Math.random() * 100;
    const duration = Math.random() * 1.5 + 0.5;
    const color = `hsl(${Math.random() * 60 + 200}, 100%, 70%)`;
    
    star.style.cssText = `
        position: absolute;
        left: ${x}vw;
        top: -20px;
        width: 2px;
        height: 20px;
        background: linear-gradient(180deg, ${color}, transparent);
        animation: starFall ${duration}s linear;
        filter: drop-shadow(0 0 10px ${color});
    `;
    
    container.appendChild(star);
    
    // Remove after animation
    setTimeout(() => star.remove(), duration * 1000);
}

function createClickStar(x, y) {
    const star = document.createElement('div');
    star.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: white;
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 9998;
        animation: clickStar 0.6s ease-out forwards;
    `;
    
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 600);
}

function createStarsBurst() {
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            createClickStar(x, y);
        }, i * 30);
    }
}

// ====================== HOVER EFFECTS ======================
function setupHoverEffects() {
    // Skills hover
    document.querySelectorAll('.skills-box span').forEach(skill => {
        skill.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.1)';
            this.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.4)';
        });
        
        skill.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Project cards hover
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Buttons click effect
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// ====================== UTILITIES ======================
function updateFooterYear() {
    const footer = document.querySelector('footer p');
    if (footer) {
        footer.textContent = `© ${new Date().getFullYear()} Zain | All Rights Reserved`;
    }
}

// ====================== ADD CSS ANIMATIONS ======================
const style = document.createElement('style');
style.textContent = `
    /* Alert animations */
    @keyframes alertSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes alertSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    /* Star animations */
    @keyframes starTwinkle {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
    }
    
    @keyframes starFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    
    @keyframes clickStar {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
    }
    
    /* Smooth section reveal */
    section {
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .alert-message button {
        background: transparent;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0 0 0 10px;
        line-height: 1;
    }
`;
document.head.appendChild(style);

// ====================== SCROLL EFFECTS ======================
window.addEventListener('scroll', () => {
    // Navbar effect
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(2, 6, 23, 0.98)';
        header.style.backdropFilter = 'blur(20px)';
        header.style.boxShadow = '0 5px 20px rgba(99, 102, 241, 0.2)';
    } else {
        header.style.background = 'rgba(2, 6, 23, 0.95)';
        header.style.backdropFilter = 'blur(15px)';
        header.style.boxShadow = 'none';
    }
    
    // Section reveal on scroll
    document.querySelectorAll('section').forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
});

// Initialize on load
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s';

console.log('✨ Portfolio JS Ready!');
        
