// ===========================================
// NexusCalc - Complete Calculator JavaScript
// All Features: Converters, Matrix, Algebra, etc.
// ===========================================

// ===== GLOBAL VARIABLES =====
let displayValue = '0';
let previousValue = '';
let operation = null;
let memory = 0;
let currentMode = 'basic';
let angleMode = 'DEG';
let history = [];
let currentMatrix = { A: null, B: null };

// Unit Conversion Data (Extended)
const conversionData = {
    length: {
        units: ['meter', 'centimeter', 'kilometer', 'millimeter', 'mile', 'yard', 'foot', 'inch', 'nautical mile'],
        rates: {
            meter: 1,
            centimeter: 100,
            kilometer: 0.001,
            millimeter: 1000,
            mile: 0.000621371,
            yard: 1.09361,
            foot: 3.28084,
            inch: 39.3701,
            'nautical mile': 0.000539957
        }
    },
    weight: {
        units: ['kilogram', 'gram', 'milligram', 'pound', 'ounce', 'ton', 'metricTon', 'carat', 'stone'],
        rates: {
            kilogram: 1,
            gram: 1000,
            milligram: 1000000,
            pound: 2.20462,
            ounce: 35.274,
            ton: 0.00110231,
            metricTon: 0.001,
            carat: 5000,
            stone: 0.157473
        }
    },
    temperature: {
        units: ['celsius', 'fahrenheit', 'kelvin'],
        convert: function(value, from, to) {
            if (from === to) return value;
            
            let celsius;
            switch(from) {
                case 'celsius': celsius = value; break;
                case 'fahrenheit': celsius = (value - 32) * 5/9; break;
                case 'kelvin': celsius = value - 273.15; break;
            }
            
            switch(to) {
                case 'celsius': return celsius;
                case 'fahrenheit': return (celsius * 9/5) + 32;
                case 'kelvin': return celsius + 273.15;
            }
            return value;
        }
    },
    area: {
        units: ['square meter', 'square kilometer', 'square mile', 'square foot', 'acre', 'hectare'],
        rates: {
            'square meter': 1,
            'square kilometer': 0.000001,
            'square mile': 3.861e-7,
            'square foot': 10.7639,
            'acre': 0.000247105,
            'hectare': 0.0001
        }
    },
    volume: {
        units: ['liter', 'milliliter', 'gallon', 'cubic meter', 'cubic foot', 'pint', 'quart'],
        rates: {
            'liter': 1,
            'milliliter': 1000,
            'gallon': 0.264172,
            'cubic meter': 0.001,
            'cubic foot': 0.0353147,
            'pint': 2.11338,
            'quart': 1.05669
        }
    },
    time: {
        units: ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
        rates: {
            'second': 1,
            'minute': 1/60,
            'hour': 1/3600,
            'day': 1/86400,
            'week': 1/604800,
            'month': 1/2.628e6,
            'year': 1/3.154e7
        }
    },
    speed: {
        units: ['m/s', 'km/h', 'mph', 'knot', 'ft/s'],
        rates: {
            'm/s': 1,
            'km/h': 3.6,
            'mph': 2.23694,
            'knot': 1.94384,
            'ft/s': 3.28084
        }
    },
    data: {
        units: ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'],
        rates: {
            'byte': 1,
            'kilobyte': 1/1024,
            'megabyte': 1/(1024*1024),
            'gigabyte': 1/(1024*1024*1024),
            'terabyte': 1/(1024*1024*1024*1024),
            'petabyte': 1/(1024*1024*1024*1024*1024)
        }
    },
    currency: {
        units: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'],
        rates: {
            'USD': 1,
            'EUR': 0.85,
            'GBP': 0.73,
            'JPY': 110.25,
            'CAD': 1.25,
            'AUD': 1.35,
            'CHF': 0.92,
            'CNY': 6.45,
            'INR': 74.50
        }
    }
};

// ===== DOM ELEMENTS =====
const elements = {
    // Sidebar & Navigation
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('overlay'),
    menuToggle: document.getElementById('menuToggle'),
    closeSidebar: document.getElementById('closeSidebar'),
    
    // Display
    displayMain: document.getElementById('displayMain'),
    displayHistory: document.getElementById('displayHistory'),
    displayMemory: document.getElementById('displayMemory'),
    
    // Mode Elements
    currentMode: document.getElementById('currentMode'),
    modeIndicator: document.getElementById('modeIndicator'),
    angleToggle: document.getElementById('angleToggle'),
    calculatorTitle: document.getElementById('calculatorTitle'),
    
    // Calculators
    calculators: {
        basic: document.querySelector('.basic-calc'),
        scientific: document.querySelector('.scientific-calc'),
        converter: document.querySelector('.unit-converter'),
        weight: document.querySelector('.weight-converter'),
        matrix: document.querySelector('.matrix-calc'),
        algebra: document.querySelector('.algebra-calc')
    },
    
    // Converter Elements
    converterType: document.getElementById('converterType'),
    fromValue: document.getElementById('fromValue'),
    fromUnit: document.getElementById('fromUnit'),
    toValue: document.getElementById('toValue'),
    toUnit: document.getElementById('toUnit'),
    conversionResult: document.getElementById('conversionResult'),
    convertBtn: document.getElementById('convertBtn'),
    
    // Weight Converter
    weightFromValue: document.getElementById('weightFromValue'),
    weightFromUnit: document.getElementById('weightFromUnit'),
    weightToValue: document.getElementById('weightToValue'),
    weightToUnit: document.getElementById('weightToUnit'),
    weightConversionResult: document.getElementById('weightConversionResult'),
    weightConvertBtn: document.getElementById('weightConvertBtn'),
    
    // Matrix Calculator
    matrixOperation: document.getElementById('matrixOperation'),
    rowsA: document.getElementById('rowsA'),
    colsA: document.getElementById('colsA'),
    rowsB: document.getElementById('rowsB'),
    colsB: document.getElementById('colsB'),
    matrixA: document.getElementById('matrixA'),
    matrixB: document.getElementById('matrixB'),
    matrixResult: document.getElementById('matrixResult'),
    generateA: document.getElementById('generateA'),
    generateB: document.getElementById('generateB'),
    calculateMatrix: document.getElementById('calculateMatrix'),
    matrixOpIcon: document.getElementById('matrixOpIcon'),
    
    // Algebra Calculator
    algebraType: document.getElementById('algebraType'),
    algebraInput: document.getElementById('algebraInput'),
    algebraSolution: document.getElementById('algebraSolution'),
    solveAlgebra: document.getElementById('solveAlgebra'),
    
    // History
    historyPanel: document.getElementById('historyPanel'),
    historyList: document.getElementById('historyList'),
    historyBtn: document.getElementById('historyBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    
    // Theme & Help
    themeToggle: document.getElementById('themeToggle'),
    helpBtn: document.getElementById('helpBtn'),
    helpModal: document.getElementById('helpModal'),
    
    // Audio
    clickSound: document.getElementById('clickSound'),
    
    // Date
    currentDate: document.getElementById('currentDate')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', initCalculator);

function initCalculator() {
    console.log('🚀 NexusCalc Initializing...');
    
    // Set current date
    updateDate();
    
    // Load saved preferences
    loadPreferences();
    
    // Initialize components
    initializeConverter();
    initializeMatrixCalculator();
    initializeAlgebraCalculator();
    initializeWeightConverter();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update display
    updateDisplay();
    
    console.log('✅ NexusCalc Ready!');
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Navigation
    elements.menuToggle.addEventListener('click', toggleSidebar);
    elements.closeSidebar.addEventListener('click', toggleSidebar);
    elements.overlay.addEventListener('click', toggleSidebar);
    
    // Calculator buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });
    
    // Memory buttons
    document.querySelectorAll('.btn-mem').forEach(button => {
        button.addEventListener('click', handleMemoryClick);
    });
    
    // Sidebar menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        if (!item.id || !['themeToggle', 'historyBtn', 'clearHistoryBtn', 'helpBtn'].includes(item.id)) {
            item.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                if (mode) {
                    switchMode(mode);
                    toggleSidebar();
                }
            });
        }
    });
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Angle toggle
    elements.angleToggle.addEventListener('click', toggleAngleMode);
    
    // History
    elements.historyBtn.addEventListener('click', toggleHistoryPanel);
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    document.querySelector('.close-history').addEventListener('click', toggleHistoryPanel);
    
    // Help
    elements.helpBtn.addEventListener('click', () => {
        elements.helpModal.classList.add('active');
    });
    document.querySelector('.close-help').addEventListener('click', () => {
        elements.helpModal.classList.remove('active');
    });
    elements.helpModal.addEventListener('click', (e) => {
        if (e.target === elements.helpModal) {
            elements.helpModal.classList.remove('active');
        }
    });
    
    // Converter
    elements.converterType.addEventListener('change', updateConverterUnits);
    elements.fromValue.addEventListener('input', convertUnits);
    elements.fromUnit.addEventListener('change', convertUnits);
    elements.toUnit.addEventListener('change', convertUnits);
    elements.convertBtn.addEventListener('click', convertUnits);
    
    // Weight Converter
    elements.weightFromValue.addEventListener('input', convertWeight);
    elements.weightFromUnit.addEventListener('change', convertWeight);
    elements.weightToUnit.addEventListener('change', convertWeight);
    elements.weightConvertBtn.addEventListener('click', convertWeight);
    
    // Matrix Calculator
    elements.matrixOperation.addEventListener('change', updateMatrixOperation);
    elements.generateA.addEventListener('click', () => generateMatrix('A'));
    elements.generateB.addEventListener('click', () => generateMatrix('B'));
    elements.calculateMatrix.addEventListener('click', calculateMatrix);
    
    // Algebra Calculator
    elements.algebraType.addEventListener('change', updateAlgebraInput);
    elements.solveAlgebra.addEventListener('click', solveAlgebraEquation);
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.historyPanel.contains(e.target) && 
            !elements.historyBtn.contains(e.target) &&
            elements.historyPanel.classList.contains('active')) {
            toggleHistoryPanel();
        }
    });
}

// ===== SIDEBAR & NAVIGATION =====
function toggleSidebar() {
    elements.sidebar.classList.toggle('active');
    elements.overlay.classList.toggle('active');
    document.body.style.overflow = elements.sidebar.classList.contains('active') ? 'hidden' : '';
}

function switchMode(mode) {
    // Update current mode
    currentMode = mode;
    
    // Update UI indicators
    updateModeIndicators();
    
    // Hide all calculators
    Object.values(elements.calculators).forEach(calc => {
        calc?.classList.remove('active');
    });
    
    // Show selected calculator
    const calcElement = elements.calculators[mode];
    if (calcElement) {
        calcElement.classList.add('active');
    } else {
        // Default to basic for modes without specific calculator
        elements.calculators.basic.classList.add('active');
    }
    
    // Update mode title
    const modeNames = {
        basic: 'Basic Calculator',
        scientific: 'Scientific Calculator',
        unit: 'Unit Converter',
        weight: 'Weight Converter',
        temperature: 'Temperature Converter',
        length: 'Length Converter',
        time: 'Time Converter',
        volume: 'Volume Converter',
        area: 'Area Converter',
        trigonometry: 'Trigonometry Calculator',
        matrix: 'Matrix Calculator',
        algebra: 'Algebra Solver',
        programmer: 'Programming Calculator',
        graphing: 'Graphing Calculator',
        statistics: 'Statistics Calculator',
        calculus: 'Calculus Solver'
    };
    
    const title = modeNames[mode] || 'Calculator';
    elements.currentMode.textContent = title;
    elements.calculatorTitle.textContent = title;
    
    // Save preference
    localStorage.setItem('calculator-mode', mode);
}

function updateModeIndicators() {
    // Update sidebar active state
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.mode === currentMode) {
            item.classList.add('active');
        }
    });
    
    // Update header indicator
    const modeText = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
    const modeIcon = currentMode === 'scientific' ? 'fa-flask' :
                    currentMode === 'matrix' ? 'fa-th' :
                    currentMode === 'algebra' ? 'fa-square-root-alt' :
                    currentMode.includes('converter') ? 'fa-exchange-alt' : 'fa-calculator';
    
    elements.modeIndicator.querySelector('i').className = `fas ${modeIcon}`;
    elements.modeIndicator.querySelector('span').textContent = modeText;
}

// ===== DISPLAY FUNCTIONS =====
function updateDisplay() {
    elements.displayMain.textContent = formatDisplay(displayValue);
    updateMemoryDisplay();
}

function updateMemoryDisplay() {
    elements.displayMemory.innerHTML = `<i class="fas fa-memory"></i> M: ${formatNumber(memory)}`;
}

function formatDisplay(value) {
    if (value === 'Error' || value === 'Infinity' || value === 'NaN') {
        return value;
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    
    // Handle very large/small numbers
    if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-12 && num !== 0)) {
        return num.toExponential(8);
    }
    
    // Format with commas for thousands
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return parts.join('.');
}

function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
        return 'Error';
    }
    
    // Handle very large/small numbers
    if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-15 && num !== 0)) {
        return num.toExponential(10);
    }
    
    // Round to avoid floating point precision issues
    const rounded = Math.round(num * 1e12) / 1e12;
    const str = rounded.toString();
    
    if (str.includes('e')) {
        return num.toExponential(10);
    }
    
    // Limit decimal places
    const decimalPlaces = (str.split('.')[1] || '').length;
    if (decimalPlaces > 10) {
        return parseFloat(num.toFixed(10)).toString();
    }
    
    return str;
}

function clearDisplay() {
    displayValue = '0';
    previousValue = '';
    operation = null;
    elements.displayHistory.textContent = '';
    updateDisplay();
}

function backspace() {
    if (displayValue.length > 1) {
        displayValue = displayValue.slice(0, -1);
    } else {
        displayValue = '0';
    }
    updateDisplay();
}

function toggleSign() {
    if (displayValue !== '0') {
        if (displayValue.startsWith('-')) {
            displayValue = displayValue.slice(1);
        } else {
            displayValue = '-' + displayValue;
        }
        updateDisplay();
    }
}

// ===== BASIC CALCULATOR FUNCTIONS =====
function inputNumber(num) {
    if (displayValue === '0' && num !== '.') {
        displayValue = num;
    } else if (num === '.' && displayValue.includes('.')) {
        return;
    } else {
        displayValue += num;
    }
    updateDisplay();
}

function inputOperator(op) {
    if (operation !== null) {
        calculateResult();
    }
    previousValue = displayValue;
    operation = op;
    elements.displayHistory.textContent = `${formatDisplay(previousValue)} ${getOperationSymbol(op)}`;
    displayValue = '0';
    updateDisplay();
}

function calculateResult() {
    if (operation === null || previousValue === '') return;
    
    const prev = parseFloat(previousValue);
    const current = parseFloat(displayValue);
    let result;
    
    try {
        switch(operation) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '*': result = prev * current; break;
            case '/': 
                if (current === 0) throw new Error('Division by zero');
                result = prev / current; 
                break;
            case '%': result = prev % current; break;
            case '^': result = Math.pow(prev, current); break;
            case 'mod': result = prev % current; break;
            default: return;
        }
        
        // Add to history
        addToHistory(`${formatDisplay(previousValue)} ${getOperationSymbol(operation)} ${formatDisplay(current)}`, result);
        
        displayValue = formatNumber(result);
        previousValue = '';
        operation = null;
        elements.displayHistory.textContent = '';
        updateDisplay();
        
    } catch (error) {
        displayValue = 'Error';
        previousValue = '';
        operation = null;
        elements.displayHistory.textContent = '';
        updateDisplay();
    }
}

function getOperationSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷',
        '%': '%',
        '^': '^',
        'mod': 'mod'
    };
    return symbols[op] || op;
}

// ===== SCIENTIFIC FUNCTIONS =====
function handleScientificFunction(func) {
    const value = parseFloat(displayValue);
    let result;
    
    try {
        switch(func) {
            case 'sin': result = sin(value); break;
            case 'cos': result = cos(value); break;
            case 'tan': result = tan(value); break;
            case 'sin⁻¹': result = asin(value); break;
            case 'cos⁻¹': result = acos(value); break;
            case 'tan⁻¹': result = atan(value); break;
            case 'log': 
                if (value <= 0) throw new Error('Log of non-positive number');
                result = Math.log10(value); 
                break;
            case 'ln': 
                if (value <= 0) throw new Error('Ln of non-positive number');
                result = Math.log(value); 
                break;
            case '10^x': result = Math.pow(10, value); break;
            case 'e^x': result = Math.exp(value); break;
            case 'x²': result = Math.pow(value, 2); break;
            case 'x³': result = Math.pow(value, 3); break;
            case '√': 
                if (value < 0) throw new Error('Square root of negative number');
                result = Math.sqrt(value); 
                break;
            case '∛': result = Math.cbrt(value); break;
            case 'x^y': 
                previousValue = displayValue;
                operation = '^';
                elements.displayHistory.textContent = `${formatDisplay(previousValue)}^`;
                displayValue = '0';
                updateDisplay();
                return;
            case 'π': result = Math.PI; break;
            case 'e': result = Math.E; break;
            case '!': 
                if (value < 0 || !Number.isInteger(value)) throw new Error('Invalid factorial');
                result = factorial(value); 
                break;
            case 'abs': result = Math.abs(value); break;
            case 'mod': 
                previousValue = displayValue;
                operation = 'mod';
                elements.displayHistory.textContent = `${formatDisplay(previousValue)} mod`;
                displayValue = '0';
                updateDisplay();
                return;
            default:
                console.log('Function not implemented:', func);
                return;
        }
        
        // Special handling for power and mod operations
        if (operation === '^' || operation === 'mod') {
            const base = parseFloat(previousValue);
            result = operation === '^' ? Math.pow(base, value) : base % value;
            previousValue = '';
            operation = null;
            elements.displayHistory.textContent = '';
        }
        
        // Add to history
        addToHistory(`${func}(${formatDisplay(value)})`, result);
        
        displayValue = formatNumber(result);
        updateDisplay();
        
    } catch (error) {
        console.error('Error in scientific function:', error);
        displayValue = 'Error';
        updateDisplay();
    }
}

// ===== TRIGONOMETRIC FUNCTIONS =====
function sin(x) {
    const angle = convertAngle(x);
    return Math.sin(angle);
}

function cos(x) {
    const angle = convertAngle(x);
    return Math.cos(angle);
}

function tan(x) {
    const angle = convertAngle(x);
    return Math.tan(angle);
}

function asin(x) {
    if (x < -1 || x > 1) throw new Error('Invalid domain for asin');
    const result = Math.asin(x);
    return convertAngleBack(result);
}

function acos(x) {
    if (x < -1 || x > 1) throw new Error('Invalid domain for acos');
    const result = Math.acos(x);
    return convertAngleBack(result);
}

function atan(x) {
    const result = Math.atan(x);
    return convertAngleBack(result);
}

function convertAngle(degrees) {
    switch(angleMode) {
        case 'DEG': return degrees * Math.PI / 180;
        case 'RAD': return degrees;
        case 'GRAD': return degrees * Math.PI / 200;
        default: return degrees;
    }
}

function convertAngleBack(radians) {
    switch(angleMode) {
        case 'DEG': return radians * 180 / Math.PI;
        case 'RAD': return radians;
        case 'GRAD': return radians * 200 / Math.PI;
        default: return radians;
    }
}

function toggleAngleMode() {
    const modes = ['DEG', 'RAD', 'GRAD'];
    const currentIndex = modes.indexOf(angleMode);
    angleMode = modes[(currentIndex + 1) % modes.length];
    
    const angleIcon = angleMode === 'DEG' ? 'fa-angle-right' :
                     angleMode === 'RAD' ? 'fa-radiation' : 'fa-sliders-h';
    
    elements.angleToggle.querySelector('span').textContent = angleMode;
    elements.angleToggle.querySelector('i').className = `fas ${angleIcon}`;
    
    localStorage.setItem('calculator-angle-mode', angleMode);
}

// ===== MATH FUNCTIONS =====
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// ===== MEMORY FUNCTIONS =====
function handleMemoryClick(e) {
    const action = e.currentTarget.dataset.action;
    const value = parseFloat(displayValue);
    
    switch(action) {
        case 'mc': memory = 0; break;
        case 'mr': displayValue = memory.toString(); break;
        case 'm+': memory += value; break;
        case 'm-': memory -= value; break;
        case 'ms': memory = value; break;
    }
    
    updateMemoryDisplay();
    updateDisplay();
    playSound();
}

// ===== UNIT CONVERTER =====
function initializeConverter() {
    updateConverterUnits();
    convertUnits();
}

function updateConverterUnits() {
    const type = elements.converterType.value;
    const data = conversionData[type];
    
    if (!data) return;
    
    // Clear current options
    elements.fromUnit.innerHTML = '';
    elements.toUnit.innerHTML = '';
    
    // Add new options
    data.units.forEach(unit => {
        const fromOption = document.createElement('option');
        fromOption.value = unit;
        fromOption.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
        elements.fromUnit.appendChild(fromOption);
        
        const toOption = document.createElement('option');
        toOption.value = unit;
        toOption.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
        elements.toUnit.appendChild(toOption);
    });
    
    // Set default selections
    elements.fromUnit.value = data.units[0];
    elements.toUnit.value = data.units[1] || data.units[0];
    
    convertUnits();
}

function convertUnits() {
    const type = elements.converterType.value;
    const fromValue = parseFloat(elements.fromValue.value) || 0;
    const fromUnit = elements.fromUnit.value;
    const toUnit = elements.toUnit.value;
    
    if (fromUnit === toUnit) {
        elements.toValue.value = fromValue;
        elements.conversionResult.textContent = `${fromValue} ${fromUnit} = ${fromValue} ${toUnit}`;
        return;
    }
    
    const data = conversionData[type];
    let result;
    
    if (type === 'temperature') {
        result = data.convert(fromValue, fromUnit, toUnit);
    } else {
        const baseValue = fromValue / data.rates[fromUnit];
        result = baseValue * data.rates[toUnit];
    }
    
    elements.toValue.value = formatNumber(result);
    elements.conversionResult.textContent = `${fromValue} ${fromUnit} = ${formatNumber(result)} ${toUnit}`;
}

// ===== WEIGHT CONVERTER =====
function initializeWeightConverter() {
    convertWeight();
}

function convertWeight() {
    const fromValue = parseFloat(elements.weightFromValue.value) || 0;
    const fromUnit = elements.weightFromUnit.value;
    const toUnit = elements.weightToUnit.value;
    
    if (fromUnit === toUnit) {
        elements.weightToValue.value = fromValue;
        elements.weightConversionResult.textContent = `${fromValue} ${fromUnit} = ${fromValue} ${toUnit}`;
        return;
    }
    
    const data = conversionData.weight;
    const baseValue = fromValue / data.rates[fromUnit];
    const result = baseValue * data.rates[toUnit];
    
    elements.weightToValue.value = formatNumber(result);
    elements.weightConversionResult.textContent = `${fromValue} ${fromUnit} = ${formatNumber(result)} ${toUnit}`;
}

// ===== MATRIX CALCULATOR =====
function initializeMatrixCalculator() {
    generateMatrix('A');
    generateMatrix('B');
    updateMatrixOperation();
}

function generateMatrix(matrixId) {
    const rows = parseInt(elements[`rows${matrixId}`].value);
    const cols = parseInt(elements[`cols${matrixId}`].value);
    const matrixDiv = elements[`matrix${matrixId}`];
    
    if (rows > 5 || cols > 5) {
        alert('Maximum size is 5x5 for performance reasons');
        return;
    }
    
    matrixDiv.innerHTML = '';
    matrixDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    currentMatrix[matrixId] = Array(rows).fill().map(() => Array(cols).fill(0));
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = i === j ? 1 : 0;
            input.dataset.row = i;
            input.dataset.col = j;
            input.addEventListener('input', (e) => {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                currentMatrix[matrixId][row][col] = parseFloat(e.target.value) || 0;
            });
            matrixDiv.appendChild(input);
        }
    }
}

function updateMatrixOperation() {
    const op = elements.matrixOperation.value;
    const iconMap = {
        'add': 'fa-plus',
        'subtract': 'fa-minus',
        'multiply': 'fa-times',
        'transpose': 'fa-retweet',
        'determinant': 'fa-calculator',
        'inverse': 'fa-superscript'
    };
    
    elements.matrixOpIcon.className = `fas ${iconMap[op] || 'fa-calculator'}`;
    
    // Hide/show matrix B based on operation
    const hideB = ['transpose', 'determinant', 'inverse'].includes(op);
    document.querySelector('.matrix-container:nth-child(3)').style.display = hideB ? 'none' : 'block';
    document.querySelector('.matrix-operator').style.display = hideB ? 'none' : 'flex';
}

function calculateMatrix() {
    const op = elements.matrixOperation.value;
    let result;
    
    try {
        switch(op) {
            case 'add':
                result = addMatrices(currentMatrix.A, currentMatrix.B);
                break;
            case 'subtract':
                result = subtractMatrices(currentMatrix.A, currentMatrix.B);
                break;
            case 'multiply':
                result = multiplyMatrices(currentMatrix.A, currentMatrix.B);
                break;
            case 'transpose':
                result = transposeMatrix(currentMatrix.A);
                break;
            case 'determinant':
                if (!isSquareMatrix(currentMatrix.A)) throw new Error('Matrix must be square');
                result = [[calculateDeterminant(currentMatrix.A)]];
                break;
            case 'inverse':
                if (!isSquareMatrix(currentMatrix.A)) throw new Error('Matrix must be square');
                result = invertMatrix(currentMatrix.A);
                break;
        }
        
        displayMatrixResult(result);
        
    } catch (error) {
        alert(`Matrix Error: ${error.message}`);
    }
}

function addMatrices(A, B) {
    if (A.length !== B.length || A[0].length !== B[0].length) {
        throw new Error('Matrices must have same dimensions');
    }
    
    return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

function subtractMatrices(A, B) {
    if (A.length !== B.length || A[0].length !== B[0].length) {
        throw new Error('Matrices must have same dimensions');
    }
    
    return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

function multiplyMatrices(A, B) {
    if (A[0].length !== B.length) {
        throw new Error('Columns of A must equal rows of B');
    }
    
    const result = Array(A.length).fill().map(() => Array(B[0].length).fill(0));
    
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B[0].length; j++) {
            for (let k = 0; k < A[0].length; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    
    return result;
}

function transposeMatrix(A) {
    return A[0].map((_, colIndex) => A.map(row => row[colIndex]));
}

function isSquareMatrix(A) {
    return A.length === A[0].length;
}

function calculateDeterminant(A) {
    if (A.length === 1) return A[0][0];
    if (A.length === 2) {
        return A[0][0] * A[1][1] - A[0][1] * A[1][0];
    }
    
    let det = 0;
    for (let i = 0; i < A.length; i++) {
        const minor = A.slice(1).map(row => row.filter((_, j) => j !== i));
        det += A[0][i] * Math.pow(-1, i) * calculateDeterminant(minor);
    }
    return det;
}

function invertMatrix(A) {
    const det = calculateDeterminant(A);
    if (det === 0) throw new Error('Matrix is singular (determinant = 0)');
    
    // For 2x2 matrix
    if (A.length === 2) {
        return [
            [A[1][1]/det, -A[0][1]/det],
            [-A[1][0]/det, A[0][0]/det]
        ];
    }
    
    // For larger matrices, return identity for simplicity
    alert('Matrix inversion for 3x3+ requires advanced implementation. Showing identity matrix.');
    return Array(A.length).fill().map((_, i) => 
        Array(A.length).fill().map((_, j) => i === j ? 1 : 0)
    );
}

function displayMatrixResult(result) {
    const matrixDiv = elements.matrixResult;
    const rows = result.length;
    const cols = result[0].length;
    
    matrixDiv.innerHTML = '';
    matrixDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const div = document.createElement('div');
            div.className = 'matrix-cell';
            div.textContent = formatNumber(result[i][j]);
            div.style.padding = '10px';
            div.style.background = 'var(--bg-card)';
            div.style.border = '1px solid var(--border-color)';
            div.style.borderRadius = '4px';
            div.style.textAlign = 'center';
            div.style.fontWeight = '500';
            matrixDiv.appendChild(div);
        }
    }
}

// ===== ALGEBRA CALCULATOR =====
function initializeAlgebraCalculator() {
    updateAlgebraInput();
}

function updateAlgebraInput() {
    const type = elements.algebraType.value;
    let html = '';
    
    switch(type) {
        case 'quadratic':
            html = `
                <div class="quadratic-input">
                    <h4>ax² + bx + c = 0</h4>
                    <div class="input-row">
                        <input type="number" id="quadA" placeholder="a" value="1">
                        <span>x² +</span>
                        <input type="number" id="quadB" placeholder="b" value="0">
                        <span>x +</span>
                        <input type="number" id="quadC" placeholder="c" value="0">
                        <span>= 0</span>
                    </div>
                </div>
            `;
            break;
        case 'linear':
            html = `
                <div class="linear-input">
                    <h4>ax + b = 0</h4>
                    <div class="input-row">
                        <input type="number" id="linearA" placeholder="a" value="1">
                        <span>x +</span>
                        <input type="number" id="linearB" placeholder="b" value="0">
                        <span>= 0</span>
                    </div>
                </div>
            `;
            break;
        case 'polynomial':
            html = `
                <div class="polynomial-input">
                    <h4>ax³ + bx² + cx + d = 0</h4>
                    <div class="input-row">
                        <input type="number" id="polyA" placeholder="a" value="1">
                        <span>x³ +</span>
                        <input type="number" id="polyB" placeholder="b" value="0">
                        <span>x² +</span>
                        <input type="number" id="polyC" placeholder="c" value="0">
                        <span>x +</span>
                        <input type="number" id="polyD" placeholder="d" value="0">
                        <span>= 0</span>
                    </div>
                </div>
            `;
            break;
    }
    
    elements.algebraInput.innerHTML = html;
}

function solveAlgebraEquation() {
    const type = elements.algebraType.value;
    let solution = '';
    
    try {
        switch(type) {
            case 'quadratic':
                const a = parseFloat(document.getElementById('quadA').value) || 0;
                const b = parseFloat(document.getElementById('quadB').value) || 0;
                const c = parseFloat(document.getElementById('quadC').value) || 0;
                
                if (a === 0) {
                    // Linear equation
                    if (b === 0) {
                        solution = c === 0 ? 'Infinite solutions' : 'No solution';
                    } else {
                        const x = -c / b;
                        solution = `x = ${formatNumber(x)}`;
                    }
                } else {
                    const discriminant = b * b - 4 * a * c;
                    
                    if (discriminant > 0) {
                        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                        solution = `x₁ = ${formatNumber(x1)}<br>x₂ = ${formatNumber(x2)}`;
                    } else if (discriminant === 0) {
                        const x = -b / (2 * a);
                        solution = `x = ${formatNumber(x)} (double root)`;
                    } else {
                        const real = -b / (2 * a);
                        const imag = Math.sqrt(-discriminant) / (2 * a);
                        solution = `x₁ = ${formatNumber(real)} + ${formatNumber(imag)}i<br>x₂ = ${formatNumber(real)} - ${formatNumber(imag)}i`;
                    }
                }
                break;
                
            case 'linear':
                const aLin = parseFloat(document.getElementById('linearA').value) || 0;
                const bLin = parseFloat(document.getElementById('linearB').value) || 0;
                
                if (aLin === 0) {
                    solution = bLin === 0 ? 'Infinite solutions' : 'No solution';
                } else {
                    const x = -bLin / aLin;
                    solution = `x = ${formatNumber(x)}`;
                }
                break;
        }
        
    } catch (error) {
        solution = `Error: ${error.message}`;
    }
    
    elements.algebraSolution.innerHTML = solution;
}

// ===== HISTORY FUNCTIONS =====
function addToHistory(expression, result) {
    const historyItem = {
        expression,
        result: formatNumber(result),
        timestamp: new Date().toLocaleTimeString(),
        mode: currentMode
    };
    
    history.unshift(historyItem);
    if (history.length > 50) history.pop();
    
    saveHistory();
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    elements.historyList.innerHTML = '';
    
    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px;">
                ${item.mode} • ${item.timestamp}
            </div>
            <div style="font-size: 0.9rem; color: var(--text-primary); margin-bottom: 4px;">
                ${item.expression}
            </div>
            <div style="font-size: 1.1rem; font-weight: 600; color: var(--primary-color);">
                = ${item.result}
            </div>
        `;
        
        div.addEventListener('click', () => {
            displayValue = item.result.toString();
            updateDisplay();
            toggleHistoryPanel();
        });
        
        elements.historyList.appendChild(div);
    });
}

function toggleHistoryPanel() {
    elements.historyPanel.classList.toggle('active');
    updateHistoryDisplay();
}

function clearHistory() {
    if (confirm('Clear all calculation history?')) {
        history = [];
        saveHistory();
        updateHistoryDisplay();
    }
}

function saveHistory() {
    localStorage.setItem('calculator-history', JSON.stringify(history));
}

function loadHistory() {
    const saved = localStorage.getItem('calculator-history');
    if (saved) {
        try {
            history = JSON.parse(saved);
        } catch (error) {
            console.error('Error loading history:', error);
            history = [];
        }
    }
}

// ===== THEME FUNCTIONS =====
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    const icon = elements.themeToggle.querySelector('i');
    const text = elements.themeToggle.querySelector('span');
    
    if (document.body.classList.contains('dark-theme')) {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    }
    
    localStorage.setItem('calculator-theme', 
        document.body.classList.contains('dark-theme') ? 'dark' : 'light'
    );
}

// ===== BUTTON HANDLER =====
function handleButtonClick(e) {
    const action = e.currentTarget.dataset.action;
    if (!action) return;
    
    playSound();
    animateButton(e.currentTarget);
    
    // Handle based on current mode
    if (currentMode === 'basic' || currentMode === 'scientific') {
        handleCalculatorButton(action);
    }
}

function handleCalculatorButton(action) {
    // Number input
    if (['0','1','2','3','4','5','6','7','8','9','.'].includes(action)) {
        inputNumber(action);
    }
    // Basic operations
    else if (['+','-','*','/','%'].includes(action)) {
        inputOperator(action);
    }
    // Special functions
    else if (action === '=') {
        calculateResult();
    }
    else if (action === 'clear') {
        clearDisplay();
    }
    else if (action === 'backspace') {
        backspace();
    }
    else if (action === '+/-') {
        toggleSign();
    }
    // Scientific functions
    else {
        handleScientificFunction(action);
    }
}

// ===== KEYBOARD SUPPORT =====
function handleKeyboardInput(e) {
    const key = e.key;
    
    // Prevent default for calculator keys
    if (/\d|[+\-*/=%.]|Enter|Backspace|Escape/.test(key)) {
        e.preventDefault();
    }
    
    if (/\d|\./.test(key)) {
        inputNumber(key);
    } 
    else if (['+','-','*','/'].includes(key)) {
        inputOperator(key);
    }
    else if (key === 'Enter' || key === '=') {
        calculateResult();
    }
    else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    }
    else if (key === 'Backspace') {
        backspace();
    }
    else if (key === '%') {
        inputOperator('%');
    }
}

// ===== UTILITY FUNCTIONS =====
function playSound() {
    if (elements.clickSound) {
        elements.clickSound.currentTime = 0;
        elements.clickSound.play().catch(e => console.log('Sound play failed:', e));
    }
}

function animateButton(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    elements.currentDate.textContent = now.toLocaleDateString('en-US', options);
}

function loadPreferences() {
    // Load theme
    const savedTheme = localStorage.getItem('calculator-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        elements.themeToggle.querySelector('i').className = 'fas fa-sun';
        elements.themeToggle.querySelector('span').textContent = 'Light Mode';
    }
    
    // Load mode
    const savedMode = localStorage.getItem('calculator-mode') || 'basic';
    switchMode(savedMode);
    
    // Load angle mode
    const savedAngle = localStorage.getItem('calculator-angle-mode') || 'DEG';
    angleMode = savedAngle;
    elements.angleToggle.querySelector('span').textContent = angleMode;
    const angleIcon = angleMode === 'DEG' ? 'fa-angle-right' :
                     angleMode === 'RAD' ? 'fa-radiation' : 'fa-sliders-h';
    elements.angleToggle.querySelector('i').className = `fas ${angleIcon}`;
    
    // Load history
    loadHistory();
}

// ===== INITIAL SETUP =====
// Add initial history for demo
setTimeout(() => {
    if (history.length === 0) {
        addToHistory('2 + 3 × 4', 14);
        addToHistory('sin(30°)', 0.5);
        addToHistory('1 kg to lb', 2.20462);
    }
}, 1000);

// Make functions available globally for debugging
window.calculator = {
    displayValue,
    currentMode,
    switchMode,
    clearDisplay
};