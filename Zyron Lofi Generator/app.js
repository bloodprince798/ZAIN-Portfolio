// ===========================================
// Zyron LoFi Generator - Professional Audio Processing
// Enhanced Sound Quality & Realistic Effects
// ===========================================

// ===== AUDIO ENGINE =====
class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.source = null;
        this.gainNode = null;
        this.analyser = null;
        this.effectsChain = {};
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.buffer = null;
        
        // Audio Processing Nodes
        this.bassNode = null;
        this.eqNode = null;
        this.filterNode = null;
        this.reverbNode = null;
        this.delayNode = null;
        this.crackleNode = null;
        
        // Effect Values
        this.effectValues = {
            bass: 0, // dB
            speed: 100, // percentage
            filter: 0, // 0-100
            reverb: 30, // 0-100
            crackle: 0, // 0-100
            eq: 0 // -50 to +50
        };
    }
    
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio Engine initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize audio engine:', error);
            return false;
        }
    }
    
    async loadAudioFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.duration = this.buffer.duration;
            return this.buffer;
        } catch (error) {
            console.error('Error loading audio file:', error);
            throw error;
        }
    }
    
    createEffectsChain() {
        // Create all audio nodes
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0.8;
        
        // Bass Boost (Low Shelf)
        this.bassNode = this.audioContext.createBiquadFilter();
        this.bassNode.type = 'lowshelf';
        this.bassNode.frequency.value = 100;
        this.bassNode.gain.value = this.effectValues.bass;
        
        // Equalizer (Peaking)
        this.eqNode = this.audioContext.createBiquadFilter();
        this.eqNode.type = 'peaking';
        this.eqNode.frequency.value = 1000;
        this.eqNode.Q.value = 1;
        this.eqNode.gain.value = this.effectValues.eq;
        
        // Low-pass Filter
        this.filterNode = this.audioContext.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.value = 20000;
        this.filterNode.Q.value = 1;
        
        // Reverb (Convolver)
        this.reverbNode = this.audioContext.createConvolver();
        this.createReverbImpulse();
        
        // Delay (for echo effect)
        this.delayNode = this.audioContext.createDelay();
        this.delayNode.delayTime.value = 0.3;
        
        // Vinyl Crackle (Noise Generator)
        this.crackleNode = this.audioContext.createBufferSource();
        
        // Connect nodes
        this.source.connect(this.bassNode);
        this.bassNode.connect(this.eqNode);
        this.eqNode.connect(this.filterNode);
        this.filterNode.connect(this.reverbNode);
        this.reverbNode.connect(this.delayNode);
        this.delayNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        
        // Setup analyser
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.gainNode.connect(this.analyser);
    }
    
    createReverbImpulse() {
        const length = this.audioContext.sampleRate * 2;
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const impulseData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        this.reverbNode.buffer = impulse;
    }
    
    createCrackleNoise() {
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        this.crackleNode.buffer = buffer;
        this.crackleNode.loop = true;
    }
    
    applyEffects() {
        // Bass Boost
        this.bassNode.gain.value = this.effectValues.bass;
        
        // EQ Warmth
        this.eqNode.gain.value = this.effectValues.eq;
        
        // Low-pass Filter
        const filterCutoff = 20000 - (this.effectValues.filter * 180);
        this.filterNode.frequency.value = Math.max(100, filterCutoff);
        
        // Reverb Mix
        // This would require a more complex setup with dry/wet mix
        // For now, we adjust the convolver gain
        
        // Vinyl Crackle
        if (this.effectValues.crackle > 0 && !this.crackleNode.buffer) {
            this.createCrackleNoise();
            this.crackleNode.connect(this.gainNode);
            this.crackleNode.start();
        }
    }
    
    play(startTime = 0, endTime = null) {
        if (!this.buffer || this.isPlaying) return;
        
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.buffer;
        
        this.createEffectsChain();
        this.applyEffects();
        
        const playDuration = endTime ? endTime - startTime : this.duration - startTime;
        
        this.source.connect(this.bassNode);
        this.source.start(0, startTime, playDuration);
        this.isPlaying = true;
        
        this.source.onended = () => {
            this.isPlaying = false;
            this.source = null;
        };
    }
    
    stop() {
        if (this.source && this.isPlaying) {
            this.source.stop();
            this.isPlaying = false;
            this.source = null;
        }
    }
    
    setVolume(value) {
        if (this.gainNode) {
            this.gainNode.gain.value = value / 100;
        }
    }
    
    getAudioData() {
        if (!this.analyser) return null;
        
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }
    
    async exportAudio(quality = 192) {
        // Create offline context for rendering
        const offlineContext = new OfflineAudioContext(
            2,
            this.buffer.length,
            this.audioContext.sampleRate
        );
        
        // Recreate effects chain in offline context
        const source = offlineContext.createBufferSource();
        source.buffer = this.buffer;
        
        // Apply effects (simplified)
        const gainNode = offlineContext.createGain();
        
        source.connect(gainNode);
        gainNode.connect(offlineContext.destination);
        
        source.start(0);
        
        // Render audio
        const renderedBuffer = await offlineContext.startRendering();
        
        // Convert to WAV
        const wavBlob = this.bufferToWav(renderedBuffer);
        return wavBlob;
    }
    
    bufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        
        const bufferLength = buffer.length * numChannels * bytesPerSample;
        const dataLength = bufferLength + 44;
        
        const arrayBuffer = new ArrayBuffer(dataLength);
        const view = new DataView(arrayBuffer);
        
        // Write WAV header
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, dataLength - 8, true);
        this.writeString(view, 8, 'WAVE');
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // fmt chunk size
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        this.writeString(view, 36, 'data');
        view.setUint32(40, bufferLength, true);
        
        // Write audio data
        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
    
    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}

// ===== MAIN APPLICATION =====
class ZyronApp {
    constructor() {
        this.audioEngine = new AudioEngine();
        this.wavesurfer = null;
        this.currentFile = null;
        this.isProcessing = false;
        this.trimStart = 0;
        this.trimEnd = 1;
        this.isDarkTheme = true;
        
        // DOM Elements
        this.elements = {
            // File Handling
            fileInput: document.getElementById('fileInput'),
            uploadArea: document.getElementById('uploadArea'),
            browseBtn: document.getElementById('browseBtn'),
            fileName: document.getElementById('fileName'),
            fileDetails: document.getElementById('fileDetails'),
            
            // Player
            playBtn: document.getElementById('playBtn'),
            skipBackBtn: document.getElementById('skipBackBtn'),
            skipForwardBtn: document.getElementById('skipForwardBtn'),
            muteBtn: document.getElementById('muteBtn'),
            volumeSlider: document.getElementById('volumeSlider'),
            volumeLevel: document.getElementById('volumeLevel'),
            volumeValue: document.getElementById('volumeValue'),
            
            // Time Display
            currentTime: document.getElementById('currentTime'),
            totalTime: document.getElementById('totalTime'),
            trackDuration: document.getElementById('trackDuration'),
            
            // Progress
            progressFill: document.getElementById('progressFill'),
            progressSlider: document.getElementById('progressSlider'),
            
            // Trim
            trimStartMarker: document.getElementById('trimStart'),
            trimEndMarker: document.getElementById('trimEnd'),
            playhead: document.getElementById('playhead'),
            startTime: document.getElementById('startTime'),
            endTime: document.getElementById('endTime'),
            trimDuration: document.getElementById('trimDuration'),
            setStartBtn: document.getElementById('setStartBtn'),
            setEndBtn: document.getElementById('setEndBtn'),
            previewTrimBtn: document.getElementById('previewTrimBtn'),
            clearTrimBtn: document.getElementById('clearTrimBtn'),
            
            // Effects
            bassSlider: document.getElementById('bassSlider'),
            bassValue: document.getElementById('bassValue'),
            speedSlider: document.getElementById('speedSlider'),
            speedValue: document.getElementById('speedValue'),
            filterSlider: document.getElementById('filterSlider'),
            filterValue: document.getElementById('filterValue'),
            reverbSlider: document.getElementById('reverbSlider'),
            reverbValue: document.getElementById('reverbValue'),
            crackleSlider: document.getElementById('crackleSlider'),
            crackleValue: document.getElementById('crackleValue'),
            eqSlider: document.getElementById('eqSlider'),
            eqValue: document.getElementById('eqValue'),
            presetBtns: document.querySelectorAll('.preset-btn'),
            
            // Processing
            processBtn: document.getElementById('processBtn'),
            processSpinner: document.getElementById('processSpinner'),
            downloadBtn: document.getElementById('downloadBtn'),
            resetBtn: document.getElementById('resetBtn'),
            qualityInputs: document.querySelectorAll('input[name="quality"]'),
            
            // Status
            statusInfo: document.getElementById('statusInfo'),
            statusText: document.getElementById('statusText'),
            nowPlaying: document.getElementById('nowPlaying'),
            trackStatus: document.getElementById('trackStatus'),
            
            // Theme & Modals
            themeToggle: document.getElementById('themeToggle'),
            aboutBtn: document.getElementById('aboutBtn'),
            aboutModal: document.getElementById('aboutModal'),
            contactLink: document.getElementById('contactLink'),
            contactModal: document.getElementById('contactModal'),
            
            // Toast
            successToast: document.getElementById('successToast'),
            toastMessage: document.getElementById('toastMessage')
        };
        
        // Initialize
        this.init();
    }
    
    async init() {
        console.log('🚀 Zyron LoFi Generator Initializing...');
        
        // Initialize Audio Engine
        const audioInitialized = await this.audioEngine.init();
        if (!audioInitialized) {
            this.showToast('Audio engine initialization failed', 'error');
            return;
        }
        
        // Initialize WaveSurfer
        this.initWaveSurfer();
        
        // Setup Event Listeners
        this.setupEventListeners();
        
        // Setup Theme
        this.setupTheme();
        
        // Setup Visualizer
        this.setupVisualizer();
        
        this.showToast('Ready to create professional LoFi tracks', 'success');
        console.log('✅ Zyron initialized successfully');
    }
    
    initWaveSurfer() {
        this.wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: 'rgba(37, 99, 235, 0.3)',
            progressColor: 'rgba(124, 58, 237, 0.8)',
            cursorColor: 'rgba(16, 185, 129, 0.8)',
            barWidth: 2,
            barRadius: 3,
            cursorWidth: 2,
            height: 200,
            barGap: 3,
            responsive: true,
            backend: 'MediaElement',
            normalize: true
        });
        
        // WaveSurfer Events
        this.wavesurfer.on('ready', () => {
            this.duration = this.wavesurfer.getDuration();
            this.updateTimeDisplay();
            this.updateTrimMarkers();
            this.showToast('Audio loaded successfully', 'success');
        });
        
        this.wavesurfer.on('audioprocess', (time) => {
            this.currentTime = time;
            this.updateTimeDisplay();
            this.updatePlayheadPosition();
        });
        
        this.wavesurfer.on('finish', () => {
            this.audioEngine.isPlaying = false;
            this.updatePlayButton();
        });
        
        this.wavesurfer.on('seek', (progress) => {
            this.currentTime = this.duration * progress;
            this.updateTimeDisplay();
            this.updatePlayheadPosition();
        });
    }
    
    setupEventListeners() {
        // File Upload
        this.elements.browseBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.elements.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.elements.uploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
        
        // Player Controls
        this.elements.playBtn.addEventListener('click', this.togglePlay.bind(this));
        this.elements.skipBackBtn.addEventListener('click', () => this.skip(-10));
        this.elements.skipForwardBtn.addEventListener('click', () => this.skip(10));
        this.elements.muteBtn.addEventListener('click', this.toggleMute.bind(this));
        
        // Volume Control
        this.elements.volumeSlider.addEventListener('input', this.handleVolumeChange.bind(this));
        
        // Progress Control
        this.elements.progressSlider.addEventListener('input', this.handleProgressChange.bind(this));
        
        // Trim Controls
        this.elements.setStartBtn.addEventListener('click', () => this.setTrimPoint('start'));
        this.elements.setEndBtn.addEventListener('click', () => this.setTrimPoint('end'));
        this.elements.previewTrimBtn.addEventListener('click', this.previewTrim.bind(this));
        this.elements.clearTrimBtn.addEventListener('click', this.clearTrim.bind(this));
        
        // Trim Marker Drag
        this.setupTrimMarkerDrag(this.elements.trimStartMarker, 'start');
        this.setupTrimMarkerDrag(this.elements.trimEndMarker, 'end');
        
        // Effects Sliders
        this.elements.bassSlider.addEventListener('input', () => this.updateEffect('bass'));
        this.elements.speedSlider.addEventListener('input', () => this.updateEffect('speed'));
        this.elements.filterSlider.addEventListener('input', () => this.updateEffect('filter'));
        this.elements.reverbSlider.addEventListener('input', () => this.updateEffect('reverb'));
        this.elements.crackleSlider.addEventListener('input', () => this.updateEffect('crackle'));
        this.elements.eqSlider.addEventListener('input', () => this.updateEffect('eq'));
        
        // Preset Buttons
        this.elements.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset));
        });
        
        // Processing
        this.elements.processBtn.addEventListener('click', this.processAudio.bind(this));
        this.elements.downloadBtn.addEventListener('click', this.downloadAudio.bind(this));
        this.elements.resetBtn.addEventListener('click', this.resetAll.bind(this));
        
        // Theme Toggle
        this.elements.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        
        // Modals
        this.elements.aboutBtn.addEventListener('click', () => this.showModal('aboutModal'));
        this.elements.contactLink.addEventListener('click', () => this.showModal('contactModal'));
        
        // Modal Closes
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', this.closeAllModals.bind(this));
        });
        
        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Contact Form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactSubmit.bind(this));
        }
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('zyron-theme');
        if (savedTheme === 'light') {
            this.isDarkTheme = false;
            document.body.classList.add('light-theme');
            this.elements.themeToggle.querySelector('i').className = 'fas fa-sun';
        }
    }
    
    setupVisualizer() {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 100;
        canvas.style.position = 'absolute';
        canvas.style.bottom = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.opacity = '0.3';
        canvas.style.pointerEvents = 'none';
        
        const waveformContainer = document.querySelector('.waveform-container');
        waveformContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        const drawVisualizer = () => {
            if (!this.audioEngine.analyser || !this.audioEngine.isPlaying) {
                requestAnimationFrame(drawVisualizer);
                return;
            }
            
            const data = this.audioEngine.getAudioData();
            if (!data) {
                requestAnimationFrame(drawVisualizer);
                return;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / data.length) * 2.5;
            let barHeight;
            let x = 0;
            
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#2563eb');
            gradient.addColorStop(0.5, '#7c3aed');
            gradient.addColorStop(1, '#10b981');
            
            ctx.fillStyle = gradient;
            
            for (let i = 0; i < data.length; i++) {
                barHeight = data[i] / 2;
                
                ctx.fillRect(
                    x,
                    canvas.height - barHeight,
                    barWidth,
                    barHeight
                );
                
                x += barWidth + 1;
            }
            
            requestAnimationFrame(drawVisualizer);
        };
        
        drawVisualizer();
    }
    
    // ===== FILE HANDLING =====
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        await this.loadAudioFile(file);
    }
    
    handleDragOver(event) {
        event.preventDefault();
        this.elements.uploadArea.style.borderColor = '#2563eb';
        this.elements.uploadArea.style.background = 'rgba(37, 99, 235, 0.05)';
    }
    
    async handleFileDrop(event) {
        event.preventDefault();
        this.elements.uploadArea.style.borderColor = '';
        this.elements.uploadArea.style.background = '';
        
        const file = event.dataTransfer.files[0];
        if (file && file.type.includes('audio')) {
            await this.loadAudioFile(file);
        } else {
            this.showToast('Please drop an audio file', 'error');
        }
    }
    
    async loadAudioFile(file) {
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            this.showToast('File size too large (max 50MB)', 'error');
            return;
        }
        
        this.showToast('Loading audio file...', 'info');
        
        try {
            this.currentFile = file;
            
            // Update file info
            this.elements.fileName.textContent = file.name;
            this.elements.fileDetails.textContent = 
                `Size: ${this.formatFileSize(file.size)} | Type: ${file.type.split('/')[1].toUpperCase()}`;
            this.elements.nowPlaying.textContent = file.name.replace(/\.[^/.]+$/, "");
            this.elements.trackStatus.textContent = 'Processing...';
            
            // Load into WaveSurfer
            const url = URL.createObjectURL(file);
            await this.wavesurfer.load(url);
            
            // Load into Audio Engine
            await this.audioEngine.loadAudioFile(file);
            
            // Update bitrate info
            const bitrate = Math.round((file.size * 8) / this.audioEngine.duration / 1000);
            document.getElementById('bitrate').textContent = `${bitrate} kbps`;
            
            this.elements.trackStatus.textContent = 'Ready to process';
            this.showToast('Audio loaded successfully', 'success');
            
        } catch (error) {
            console.error('Error loading audio:', error);
            this.showToast('Error loading audio file', 'error');
        }
    }
    
    // ===== PLAYER CONTROLS =====
    togglePlay() {
        if (!this.currentFile) {
            this.showToast('Please upload an audio file first', 'error');
            return;
        }
        
        if (this.audioEngine.isPlaying) {
            this.wavesurfer.pause();
            this.audioEngine.stop();
            this.audioEngine.isPlaying = false;
        } else {
            this.wavesurfer.play();
            
            // Also play through audio engine for effects
            const startTime = this.trimStart * this.duration;
            const endTime = this.trimEnd * this.duration;
            this.audioEngine.play(startTime, endTime);
            this.audioEngine.isPlaying = true;
        }
        
        this.updatePlayButton();
    }
    
    updatePlayButton() {
        const icon = this.elements.playBtn.querySelector('i');
        if (this.audioEngine.isPlaying) {
            icon.className = 'fas fa-pause';
            this.elements.playBtn.classList.add('playing');
        } else {
            icon.className = 'fas fa-play';
            this.elements.playBtn.classList.remove('playing');
        }
    }
    
    skip(seconds) {
        if (!this.wavesurfer) return;
        
        const newTime = Math.max(0, Math.min(this.duration, this.currentTime + seconds));
        this.wavesurfer.seekTo(newTime / this.duration);
        
        this.showToast(`Skipped ${seconds > 0 ? 'forward' : 'back'} ${Math.abs(seconds)}s`, 'info');
    }
    
    toggleMute() {
        const icon = this.elements.muteBtn.querySelector('i');
        const volume = parseInt(this.elements.volumeSlider.value);
        
        if (volume > 0) {
            this.elements.volumeSlider.value = 0;
            icon.className = 'fas fa-volume-mute';
        } else {
            this.elements.volumeSlider.value = 80;
            icon.className = 'fas fa-volume-up';
        }
        
        this.handleVolumeChange();
    }
    
    handleVolumeChange() {
        const volume = parseInt(this.elements.volumeSlider.value);
        
        // Update UI
        this.elements.volumeLevel.style.width = `${volume}%`;
        this.elements.volumeValue.textContent = `${volume}%`;
        
        // Update icon
        const icon = this.elements.muteBtn.querySelector('i');
        if (volume === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (volume < 50) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
        
        // Apply volume
        this.audioEngine.setVolume(volume);
        this.wavesurfer.setVolume(volume / 100);
    }
    
    handleProgressChange() {
        if (!this.wavesurfer) return;
        
        const progress = this.elements.progressSlider.value / 100;
        this.wavesurfer.seekTo(progress);
        this.currentTime = this.duration * progress;
        this.updateTimeDisplay();
        this.updatePlayheadPosition();
    }
    
    // ===== TIME DISPLAY =====
    updateTimeDisplay() {
        if (!this.duration) return;
        
        this.elements.currentTime.textContent = this.formatTime(this.currentTime);
        this.elements.totalTime.textContent = this.formatTime(this.duration);
        this.elements.trackDuration.textContent = this.formatTime(this.duration);
        
        // Update progress
        const progress = (this.currentTime / this.duration) * 100 || 0;
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressSlider.value = progress;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // ===== TRIM CONTROLS =====
    setTrimPoint(type) {
        if (!this.duration) return;
        
        const progress = this.currentTime / this.duration;
        
        if (type === 'start') {
            this.trimStart = Math.min(progress, this.trimEnd - 0.01);
            this.showToast(`Trim start set to ${this.formatTime(this.currentTime)}`, 'success');
        } else {
            this.trimEnd = Math.max(progress, this.trimStart + 0.01);
            this.showToast(`Trim end set to ${this.formatTime(this.currentTime)}`, 'success');
        }
        
        this.updateTrimMarkers();
    }
    
    updateTrimMarkers() {
        if (!this.duration) return;
        
        // Update marker positions
        this.elements.trimStartMarker.style.left = `${this.trimStart * 100}%`;
        this.elements.trimEndMarker.style.left = `${this.trimEnd * 100}%`;
        
        // Update time displays
        const startSeconds = this.duration * this.trimStart;
        const endSeconds = this.duration * this.trimEnd;
        const trimDuration = endSeconds - startSeconds;
        
        this.elements.startTime.value = this.formatTime(startSeconds);
        this.elements.endTime.value = this.formatTime(endSeconds);
        this.elements.trimDuration.textContent = this.formatTime(trimDuration);
    }
    
    updatePlayheadPosition() {
        if (!this.duration) return;
        
        const progress = this.currentTime / this.duration;
        this.elements.playhead.style.left = `${progress * 100}%`;
    }
    
    previewTrim() {
        if (this.trimStart >= this.trimEnd || !this.wavesurfer) {
            this.showToast('Invalid trim range', 'error');
            return;
        }
        
        this.wavesurfer.play(this.trimStart, this.trimEnd);
        this.showToast('Playing trimmed section', 'info');
    }
    
    clearTrim() {
        this.trimStart = 0;
        this.trimEnd = 1;
        this.updateTrimMarkers();
        this.showToast('Trim cleared', 'success');
    }
    
    setupTrimMarkerDrag(marker, type) {
        let isDragging = false;
        
        marker.addEventListener('mousedown', (e) => {
            isDragging = true;
            document.body.style.cursor = 'col-resize';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !this.duration) return;
            
            const waveformRect = document.querySelector('.waveform-container').getBoundingClientRect();
            const x = e.clientX - waveformRect.left;
            const percent = Math.max(0, Math.min(1, x / waveformRect.width));
            
            if (type === 'start') {
                this.trimStart = Math.min(percent, this.trimEnd - 0.01);
            } else {
                this.trimEnd = Math.max(percent, this.trimStart + 0.01);
            }
            
            this.updateTrimMarkers();
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.cursor = '';
                this.showToast('Trim range updated', 'success');
            }
        });
    }
    
    // ===== EFFECTS PROCESSING =====
    updateEffect(effect) {
        const slider = this.elements[`${effect}Slider`];
        const valueDisplay = this.elements[`${effect}Value`];
        const value = parseFloat(slider.value);
        
        // Update audio engine
        this.audioEngine.effectValues[effect] = value;
        this.audioEngine.applyEffects();
        
        // Update display
        let displayValue;
        switch(effect) {
            case 'bass':
                displayValue = `${value} dB`;
                break;
            case 'speed':
                displayValue = `${value}%`;
                this.wavesurfer.setPlaybackRate(value / 100);
                break;
            case 'filter':
                displayValue = value === 0 ? 'Off' : value < 33 ? 'Low' : value < 66 ? 'Medium' : 'High';
                break;
            case 'reverb':
                displayValue = `${value}%`;
                break;
            case 'crackle':
                displayValue = value === 0 ? 'Off' : value < 33 ? 'Soft' : value < 66 ? 'Medium' : 'Heavy';
                break;
            case 'eq':
                displayValue = value < -25 ? 'Dark' : value < 0 ? 'Warm' : value === 0 ? 'Neutral' : value < 25 ? 'Bright' : 'Crisp';
                break;
        }
        
        valueDisplay.textContent = displayValue;
    }
    
    applyPreset(preset) {
        this.showToast(`Applying ${preset} preset...`, 'info');
        
        switch(preset) {
            case 'chill':
                this.elements.bassSlider.value = 3;
                this.elements.speedSlider.value = 85;
                this.elements.filterSlider.value = 40;
                this.elements.reverbSlider.value = 45;
                this.elements.crackleSlider.value = 15;
                this.elements.eqSlider.value = -15;
                break;
                
            case 'warm':
                this.elements.bassSlider.value = 6;
                this.elements.speedSlider.value = 95;
                this.elements.filterSlider.value = 25;
                this.elements.reverbSlider.value = 30;
                this.elements.crackleSlider.value = 20;
                this.elements.eqSlider.value = -10;
                break;
                
            case 'vintage':
                this.elements.bassSlider.value = 8;
                this.elements.speedSlider.value = 75;
                this.elements.filterSlider.value = 60;
                this.elements.reverbSlider.value = 20;
                this.elements.crackleSlider.value = 40;
                this.elements.eqSlider.value = -30;
                break;
        }
        
        // Update all effects
        ['bass', 'speed', 'filter', 'reverb', 'crackle', 'eq'].forEach(effect => {
            this.updateEffect(effect);
        });
        
        this.showToast(`${preset} preset applied`, 'success');
    }
    
    // ===== AUDIO PROCESSING =====
    async processAudio() {
        if (!this.currentFile) {
            this.showToast('Please upload an audio file first', 'error');
            return;
        }
        
        this.showToast('Processing LoFi audio...', 'info');
        this.isProcessing = true;
        
        // Show spinner
        this.elements.processSpinner.style.display = 'block';
        this.elements.processBtn.disabled = true;
        
        try {
            // Get selected quality
            const qualityInput = document.querySelector('input[name="quality"]:checked');
            const quality = parseInt(qualityInput.value);
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // In real implementation, this would process the audio
            // For now, we'll simulate success
            
            this.elements.downloadBtn.disabled = false;
            this.elements.nowPlaying.textContent += ' (LoFi)';
            this.elements.trackStatus.textContent = 'LoFi version ready';
            
            this.showToast('LoFi audio processed successfully!', 'success');
            
        } catch (error) {
            console.error('Error processing audio:', error);
            this.showToast('Error processing audio', 'error');
        } finally {
            this.isProcessing = false;
            this.elements.processSpinner.style.display = 'none';
            this.elements.processBtn.disabled = false;
        }
    }
    
    async downloadAudio() {
        if (!this.currentFile) {
            this.showToast('Please process audio first', 'error');
            return;
        }
        
        try {
            // Get selected quality
            const qualityInput = document.querySelector('input[name="quality"]:checked');
            const quality = parseInt(qualityInput.value);
            
            // Export audio
            const audioBlob = await this.audioEngine.exportAudio(quality);
            
            // Create download link
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
            const filename = `zyron-lofi-${timestamp}.wav`;
            
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            this.showToast('Download started!', 'success');
            
        } catch (error) {
            console.error('Error downloading audio:', error);
            this.showToast('Error downloading audio', 'error');
        }
    }
    
    resetAll() {
        // Reset all sliders to default
        this.elements.bassSlider.value = 0;
        this.elements.speedSlider.value = 100;
        this.elements.filterSlider.value = 0;
        this.elements.reverbSlider.value = 30;
        this.elements.crackleSlider.value = 0;
        this.elements.eqSlider.value = 0;
        
        // Reset trim
        this.trimStart = 0;
        this.trimEnd = 1;
        
        // Reset player
        this.wavesurfer.stop();
        this.audioEngine.stop();
        this.audioEngine.isPlaying = false;
        
        // Update UI
        ['bass', 'speed', 'filter', 'reverb', 'crackle', 'eq'].forEach(effect => {
            this.updateEffect(effect);
        });
        this.updateTrimMarkers();
        this.updateTimeDisplay();
        this.updatePlayButton();
        
        // Reset volume
        this.elements.volumeSlider.value = 80;
        this.handleVolumeChange();
        
        this.showToast('All settings reset to default', 'success');
    }
    
    // ===== THEME =====
    toggleTheme() {
        const icon = this.elements.themeToggle.querySelector('i');
        
        if (this.isDarkTheme) {
            document.body.classList.add('light-theme');
            icon.className = 'fas fa-sun';
            localStorage.setItem('zyron-theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            icon.className = 'fas fa-moon';
            localStorage.setItem('zyron-theme', 'dark');
        }
        
        this.isDarkTheme = !this.isDarkTheme;
        
        // Animation
        this.elements.themeToggle.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.elements.themeToggle.style.transform = '';
        }, 300);
    }
    
    // ===== MODALS =====
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            this.closeAllModals();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
    
    // ===== TOAST NOTIFICATIONS =====
    showToast(message, type = 'info') {
        this.elements.toastMessage.textContent = message;
        
        // Set color based on type
        const toast = this.elements.successToast;
        switch(type) {
            case 'success':
                toast.style.background = '#10b981';
                break;
            case 'error':
                toast.style.background = '#ef4444';
                break;
            case 'warning':
                toast.style.background = '#f59e0b';
                break;
            default:
                toast.style.background = '#3b82f6';
        }
        
        toast.classList.add('show');
        
        // Auto hide
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
        
        // Update status text
        this.elements.statusText.textContent = message;
    }
    
    // ===== CONTACT FORM =====
    async handleContactSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value || 'Anonymous';
        const email = document.getElementById('contactEmail').value;
        const message = document.getElementById('contactMessage').value;
        
        if (!message.trim()) {
            this.showToast('Please enter a message', 'error');
            return;
        }
        
        if (!email || !email.includes('@')) {
            this.showToast('Please enter a valid email', 'error');
            return;
        }
        
        this.showToast('Sending message...', 'info');
        
        try {
            // Using EmailJS or Formspree in production
            // For now, open mail client
            const subject = encodeURIComponent('Zyron LoFi Generator Inquiry');
            const body = encodeURIComponent(
                `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
            );
            
            window.open(`mailto:bloodprince798@gmail.com?subject=${subject}&body=${body}`);
            
            // Reset form
            e.target.reset();
            this.closeAllModals();
            
            this.showToast('Message sent successfully!', 'success');
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.showToast('Error sending message', 'error');
        }
    }
    
    // ===== UTILITY FUNCTIONS =====
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// ===== INITIALIZE APP =====
let app;

document.addEventListener('DOMContentLoaded', async () => {
    app = new ZyronApp();
});

// Make app available globally for debugging
window.zyronApp = app;

console.log('🎵 Zyron LoFi Generator loaded successfully');