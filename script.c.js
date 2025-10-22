// Create stars for cosmic background
function createStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 150;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random position and size
        const size = Math.random() * 3;
        star.style.width = ${size}px;
        star.style.height = ${size}px;
        star.style.left = ${Math.random() * 100}%;
        star.style.top = ${Math.random() * 100}%;
        
        // Random animation delay
        star.style.animationDelay = ${Math.random() * 3}s;
        
        starsContainer.appendChild(star);
    }
}

// Calculator functionality
let display = document.getElementById('display');
let currentInput = '0';
let previousInput = '';
let operator = null;
let resetScreen = false;

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    createStars();
    updateDisplay();
});

function updateDisplay() {
    display.textContent = currentInput;
}

function append(value) {
    playClickSound();
    animateButton(event.target);
    
    if (resetScreen) {
        currentInput = '';
        resetScreen = false;
    }
    
    if (value === '.' && currentInput.includes('.')) return;
    
    if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else {
        currentInput += value;
    }
    
    updateDisplay();
}

function clearDisplay() {
    playClickSound();
    animateButton(event.target);
    
    currentInput = '0';
    previousInput = '';
    operator = null;
    updateDisplay();
}

function deleteLast() {
    playClickSound();
    animateButton(event.target);
    
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function setOperation(newOperator) {
    playClickSound();
    animateButton(event.target);
    
    if (operator !== null) calculate();
    
    previousInput = currentInput;
    operator = newOperator;
    resetScreen = true;
}

function calculate() {
    playClickSound();
    animateButton(event.target);
    
    if (operator === null || resetScreen) return;
    
    let computation;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    switch (operator) {
        case '+':
            computation = prev + current;
            break;
        case '-':
            computation = prev - current;
            break;
        case '*':
            computation = prev * current;
            break;
        case '/':
            if (current === 0) {
                computation = 'Error';
            } else {
                computation = prev / current;
            }
            break;
        case '%':
            computation = prev % current;
            break;
        default:
            return;
    }
    
    currentInput = computation.toString();
    operator = null;
    previousInput = '';
    resetScreen = true;
    
    // Add display animation
    display.classList.add('display-active');
    setTimeout(() => {
        display.classList.remove('display-active');
    }, 2000);
    
    updateDisplay();
}

// Button animation
function animateButton(button) {
    button.classList.add('pressed');
    setTimeout(() => {
        button.classList.remove('pressed');
    }, 200);
}

// Click sound effect
function playClickSound() {
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (/[0-9]/.test(key)) {
        append(key);
    } else if (key === '.') {
        append('.');
    } else if (key === '+') {
        setOperation('+');
    } else if (key === '-') {
        setOperation('-');
    } else if (key === '*') {
        setOperation('*');
    } else if (key === '/') {
        event.preventDefault();
        setOperation('/');
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape' || key === 'Delete') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === '%') {
        setOperation('%');
}
});
