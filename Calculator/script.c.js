const display = document.getElementById('display');
const clickSound = document.getElementById('ClickSound'); // ✅ ID corrected

function playSound() {
    if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(error => {
            console.log("Sound play failed:", error);
        });
    }
}

function append(value) {
    playSound();
    if (display.textContent === '0' && value !== '.') {
        display.textContent = '';
    }
    display.textContent += value;
}

function clearDisplay() {
    playSound();
    display.textContent = '0';
}

function deleteLast() {
    playSound();
    if (display.textContent.length > 1) {
        display.textContent = display.textContent.slice(0, -1);
    } else {
        clearDisplay();
    }
}

function calculate() {
    playSound();
    try {
        // Safety check for eval
        const result = eval(display.textContent);
        if (result === Infinity || isNaN(result)) {
            display.textContent = 'Error';
        } else {
            display.textContent = result;
        }
    } catch {
        display.textContent = 'Error';
    }
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if ((/\d|[+\-*/%]/).test(key)) {
        append(key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key.toLowerCase() === 'c' || key === 'Escape') {
        clearDisplay();
    } else if (key === '.') {
        append('.');
}
});