// ===== DRAGON TRACER SCRIPT =====

// Configuration
const config = {
    segments: 15,
    segmentSize: 25,
    spacing: 18,
    speed: 0.15,
    color: '#FFD700', // Gold
    trailColor: '#FF6B6B', // Red
    currentX: window.innerWidth / 2,
    currentY: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    isFollowing: true,
    trailLength: 5
};

// DOM Elements
const dragonContainer = document.getElementById('dragonContainer');
const welcomePopup = document.getElementById('welcomePopup');
const startBtn = document.getElementById('startBtn');
const skipBtn = document.getElementById('skipBtn');
const closePopupBtn = document.getElementById('closePopupBtn');
const closePanelBtn = document.getElementById('closePanelBtn');
const helpBtn = document.getElementById('helpBtn');
const instructionsPanel = document.getElementById('instructionsPanel');
const countdownElement = document.getElementById('countdown');
const fireworksCanvas = document.getElementById('fireworksCanvas');
const ctx = fireworksCanvas.getContext('2d');

// Arrays for dragon segments and trails
let segments = [];
let trails = [];

// Color presets
const colorPresets = [
    { name: 'Gold', main: '#FFD700', trail: '#FF6B6B' },
    { name: 'Blue', main: '#4ECDC4', trail: '#45B7AF' },
    { name: 'Purple', main: '#9B59B6', trail: '#8E44AD' },
    { name: 'Green', main: '#2ECC71', trail: '#27AE60' },
    { name: 'Orange', main: '#E67E22', trail: '#D35400' },
    { name: 'Pink', main: '#FF9FF3', trail: '#F368E0' }
];

let currentColorIndex = 0;
let autoCloseTimer;
let countdown = 10;

// ===== INITIALIZATION =====
function init() {
    // Set canvas size
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
    
    // Initialize dragon
    initDragon();
    
    // Start animation loop
    requestAnimationFrame(animateDragon);
    
    // Event listeners
    setupEventListeners();
    
    // Start auto-close countdown
    startAutoCloseCountdown();
    
    // Initial update of stats
    updateStats();
}

// ===== POPUP FUNCTIONS =====
function closeWelcomePopup() {
    // Remove active class to hide popup
    welcomePopup.classList.add('hidden');
    
    // Clear auto-close timer
    clearInterval(autoCloseTimer);
    
    // Enable dragon following
    config.isFollowing = true;
    
    // Update status
    document.getElementById('statusValue').textContent = 'Following';
    
    // Create welcome effect
    createWelcomeEffect();
}

function startAutoCloseCountdown() {
    // Reset countdown
    countdown = 10;
    countdownElement.textContent = countdown;
    
    // Update countdown every second
    autoCloseTimer = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            closeWelcomePopup();
        }
    }, 1000);
}

// ===== DRAGON FUNCTIONS =====
function initDragon() {
    segments = [];
    trails = [];
    
    for (let i = 0; i < config.segments; i++) {
        segments.push({
            x: config.currentX - i * config.spacing,
            y: config.currentY,
            size: config.segmentSize * (1 - i * 0.03),
            rotation: 0
        });
        
        trails.push([]);
    }
}

function animateDragon() {
    // Update dragon position
    if (config.isFollowing) {
        config.currentX += (config.targetX - config.currentX) * config.speed;
        config.currentY += (config.targetY - config.currentY) * config.speed;
    }
    
    // Clear dragon container
    dragonContainer.innerHTML = '';
    
    // Update and draw each segment
    segments.forEach((segment, index) => {
        // Calculate target position
        const target = index === 0 ? 
            { x: config.currentX, y: config.currentY } : 
            segments[index - 1];
        
        // Calculate angle and distance
        const dx = target.x - segment.x;
        const dy = target.y - segment.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Update position with smooth movement
        if (distance > config.spacing * 0.5) {
            segment.x += Math.cos(angle) * config.spacing * 0.5;
            segment.y += Math.sin(angle) * config.spacing * 0.5;
        }
        
        // Add wave motion to body segments
        if (index > 0) {
            segment.y += Math.sin(Date.now() * 0.003 + index) * 3;
        }
        
        segment.rotation = angle;
        
        // Add to trail
        trails[index].push({ x: segment.x, y: segment.y });
        if (trails[index].length > config.trailLength) {
            trails[index].shift();
        }
        
        // Draw trail
        trails[index].forEach((point, trailIndex) => {
            const trailEl = document.createElement('div');
            const size = segment.size * 0.6 * (trailIndex / trails[index].length);
            const opacity = 0.3 * (trailIndex / trails[index].length);
            
            trailEl.className = 'dragon-trail';
            trailEl.style.cssText = `
                left: ${point.x - size/2}px;
                top: ${point.y - size/2}px;
                width: ${size}px;
                height: ${size}px;
                background: ${config.trailColor};
                opacity: ${opacity};
                animation: trailFade 0.5s ease-out forwards;
            `;
            
            dragonContainer.appendChild(trailEl);
        });
        
        // Draw segment
        const segmentEl = document.createElement('div');
        segmentEl.className = 'dragon-segment';
        
        if (index === 0) {
            // Draw head
            segmentEl.className += ' dragon-head';
            segmentEl.style.cssText = `
                left: ${segment.x - segment.size}px;
                top: ${segment.y - segment.size}px;
                width: ${segment.size * 2}px;
                height: ${segment.size * 2}px;
                background: ${config.color};
                transform: rotate(${segment.rotation}rad);
                box-shadow: 0 0 30px ${config.color};
                z-index: 100;
                border-radius: 50% 50% 50% 0;
            `;
            
            // Add face details
            const faceHTML = `
                <div style="position: absolute; top: 25%; left: 25%; width: 15px; height: 15px; background: white; border-radius: 50%;"></div>
                <div style="position: absolute; top: 25%; right: 25%; width: 15px; height: 15px; background: white; border-radius: 50%;"></div>
                <div style="position: absolute; bottom: 20%; left: 50%; transform: translateX(-50%); width: 40px; height: 20px; background: ${config.trailColor}; border-radius: 10px;"></div>
                <div style="position: absolute; top: 10%; left: -10px; width: 30px; height: 50px; background: ${config.trailColor}; border-radius: 50%; transform: rotate(45deg);"></div>
                <div style="position: absolute; top: 10%; right: -10px; width: 30px; height: 50px; background: ${config.trailColor}; border-radius: 50%; transform: rotate(-45deg);"></div>
            `;
            segmentEl.innerHTML = faceHTML;
        } else {
            // Draw body segment
            segmentEl.style.cssText = `
                left: ${segment.x - segment.size/2}px;
                top: ${segment.y - segment.size/2}px;
                width: ${segment.size}px;
                height: ${segment.size}px;
                background: ${config.color};
                border: 3px solid ${config.trailColor};
                box-shadow: 0 0 15px ${config.color};
                transform: rotate(${segment.rotation}rad);
                z-index: ${config.segments - index};
            `;
        }
        
        dragonContainer.appendChild(segmentEl);
    });
    
    // Continue animation loop
    requestAnimationFrame(animateDragon);
}

// ===== EVENT HANDLING =====
function setupEventListeners() {
    // Mouse movement
    document.addEventListener('mousemove', (e) => {
        if (config.isFollowing) {
            config.targetX = e.clientX;
            config.targetY = e.clientY;
        }
    });
    
    // Touch movement
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (config.isFollowing && e.touches[0]) {
            config.targetX = e.touches[0].clientX;
            config.targetY = e.touches[0].clientY;
        }
    }, { passive: false });
    
    // Window resize
    window.addEventListener('resize', () => {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    });
    
    // Popup close buttons
    startBtn.addEventListener('click', closeWelcomePopup);
    skipBtn.addEventListener('click', closeWelcomePopup);
    closePopupBtn.addEventListener('click', closeWelcomePopup);
    
    // Help panel
    helpBtn.addEventListener('click', () => {
        instructionsPanel.classList.toggle('show');
    });
    
    closePanelBtn.addEventListener('click', () => {
        instructionsPanel.classList.remove('show');
    });
    
    // Click outside instructions panel to close
    document.addEventListener('click', (e) => {
        if (instructionsPanel.classList.contains('show') && 
            !instructionsPanel.contains(e.target) && 
            e.target !== helpBtn) {
            instructionsPanel.classList.remove('show');
        }
    });
    
    // Control buttons
    document.getElementById('colorBtn').addEventListener('click', () => {
        currentColorIndex = (currentColorIndex + 1) % colorPresets.length;
        config.color = colorPresets[currentColorIndex].main;
        config.trailColor = colorPresets[currentColorIndex].trail;
        updateStats();
        createColorEffect();
    });
    
    document.getElementById('sizeBtn').addEventListener('click', () => {
        config.segments = config.segments === 15 ? 20 : config.segments === 20 ? 10 : 15;
        config.segmentSize = config.segments === 10 ? 30 : config.segments === 20 ? 20 : 25;
        initDragon();
        updateStats();
    });
    
    document.getElementById('effectBtn').addEventListener('click', () => {
        createDragonBreath();
    });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
        config.currentX = window.innerWidth / 2;
        config.currentY = window.innerHeight / 2;
        config.targetX = window.innerWidth / 2;
        config.targetY = window.innerHeight / 2;
        initDragon();
        createResetEffect();
    });
}

// ===== STATS UPDATE =====
function updateStats() {
    document.getElementById('lengthValue').textContent = config.segments;
    document.getElementById('speedValue').textContent = 
        config.speed > 0.2 ? 'Fast' : config.speed < 0.1 ? 'Slow' : 'Medium';
    document.getElementById('colorValue').textContent = colorPresets[currentColorIndex].name;
    document.getElementById('statusValue').textContent = config.isFollowing ? 'Following' : 'Paused';
}

// ===== SPECIAL EFFECTS =====
function createWelcomeEffect() {
    // Fireworks celebration
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { 
                    x: Math.random(),
                    y: Math.random() * 0.5
                },
                colors: [config.color, config.trailColor, '#FFFFFF']
            });
        }, i * 300);
    }
    
    // Welcome message
    showTemporaryMessage("Dragon is now following your cursor! 🐉");
}

function createDragonBreath() {
    const head = segments[0];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const fire = document.createElement('div');
            const size = 8 + Math.random() * 12;
            const angle = (Math.PI / 4) + (Math.random() * Math.PI / 2);
            const distance = 50 + Math.random() * 100;
            const duration = 800 + Math.random() * 700;
            
            fire.style.cssText = `
                position: fixed;
                left: ${head.x}px;
                top: ${head.y}px;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, ${config.color}, ${config.trailColor});
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: fireBreath ${duration}ms ease-out forwards;
                box-shadow: 0 0 20px ${config.color};
            `;
            
            document.body.appendChild(fire);
            
            // Animate fire
            let startTime = Date.now();
            function animateFire() {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / duration;
                
                if (progress >= 1) {
                    fire.remove();
                    return;
                }
                
                const currentX = head.x + Math.cos(head.rotation + angle) * distance * progress;
                const currentY = head.y + Math.sin(head.rotation + angle) * distance * progress;
                
                fire.style.left = `${currentX}px`;
                fire.style.top = `${currentY}px`;
                fire.style.opacity = 1 - progress;
                
                requestAnimationFrame(animateFire);
            }
            
            animateFire();
        }, i * 30);
    }
    
    // Sound effect
    playFireSound();
}

function createColorEffect() {
    confetti({
        particleCount: 50,
        angle: 90,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: [config.color, config.trailColor, '#FFFFFF']
    });
    
    showTemporaryMessage(`Color changed to ${colorPresets[currentColorIndex].name}!`);
}

function createResetEffect() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            confetti({
                particleCount: 10,
                angle: i * 24,
                spread: 30,
                origin: { x: centerX / window.innerWidth, y: centerY / window.innerHeight },
                colors: [config.color, config.trailColor]
            });
        }, i * 100);
    }
    
    showTemporaryMessage("Dragon reset to center!");
}

function showTemporaryMessage(message) {
    // Remove existing message
    const existingMessage = document.querySelector('.temp-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = 'temp-message';
    messageEl.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(26, 31, 58, 0.9);
        backdrop-filter: blur(10px);
        color: var(--primary-gold);
        padding: 15px 30px;
        border-radius: 10px;
        border: 2px solid var(--primary-gold);
        z-index: 1000;
        font-weight: 600;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        animation: fadeInOut 3s ease-in-out;
    `;
    
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

function playFireSound() {
    // Create a simple sound effect using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        // Audio not supported, continue silently
    }
}

// Add fade animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        20% { opacity: 1; transform: translateX(-50%) translateY(0); }
        80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);

// ===== INITIALIZE WHEN PAGE LOADS =====
document.addEventListener('DOMContentLoaded', init);