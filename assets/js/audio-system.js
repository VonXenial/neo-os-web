class CyberpunkAudio {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isInitialized = false;
        this.isMuted = false;
        this.volume = 0.3;
        this.drones = [];
        this.glitchInterval = null;
        this.ambientInterval = null;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);

            // Start ambient drone
            this.startAmbientDrone();

            // Start random glitch effects
            this.startGlitchEffects();

            // Start ambient beeps
            this.startAmbientBeeps();

            this.isInitialized = true;
            console.log('[AUDIO] Neural Audio Interface initialized');

        } catch (error) {
            console.error('[AUDIO] Failed to initialize:', error);
        }
    }

    // Create a deep cyberpunk ambient drone
    startAmbientDrone() {
        const frequencies = [55, 82.5, 110, 165]; // A1, E2, A2, E3 - dark minor tones

        frequencies.forEach((freq, index) => {
            // Main oscillator
            const osc = this.audioContext.createOscillator();
            osc.type = index % 2 === 0 ? 'sawtooth' : 'triangle';
            osc.frequency.value = freq;

            // LFO for subtle modulation
            const lfo = this.audioContext.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.1 + Math.random() * 0.2;

            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = freq * 0.02;

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);

            // Filter for that dark cyberpunk sound
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400 + index * 100;
            filter.Q.value = 2;

            // Individual gain for each drone layer
            const droneGain = this.audioContext.createGain();
            droneGain.gain.value = 0.08 / (index + 1);

            // Connect the chain
            osc.connect(filter);
            filter.connect(droneGain);
            droneGain.connect(this.masterGain);

            // Start
            osc.start();
            lfo.start();

            this.drones.push({ osc, lfo, filter, droneGain });
        });

        // Add noise layer for texture
        this.addNoiseLayer();
    }

    addNoiseLayer() {
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 800;
        noiseFilter.Q.value = 0.5;

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.value = 0.015;

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noise.start();
        this.noiseSource = { noise, noiseFilter, noiseGain };
    }

    // Play terminal beep effect
    playBeep(type = 'info') {
        if (!this.isInitialized || this.isMuted) return;

        const frequencies = {
            info: [880, 1100],
            warning: [660, 440],
            success: [523, 659, 784],
            error: [200, 150]
        };

        const freqs = frequencies[type] || frequencies.info;
        const duration = type === 'success' ? 0.15 : 0.08;

        freqs.forEach((freq, i) => {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator();
                osc.type = 'square';
                osc.frequency.value = freq;

                const gain = this.audioContext.createGain();
                gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = freq;
                filter.Q.value = 5;

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.masterGain);

                osc.start();
                osc.stop(this.audioContext.currentTime + duration);
            }, i * 80);
        });
    }

    // Play glitch sound effect
    playGlitch() {
        if (!this.isInitialized || this.isMuted) return;

        const duration = 0.05 + Math.random() * 0.1;

        // Create noise burst
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000 + Math.random() * 3000;

        const gain = this.audioContext.createGain();
        gain.gain.value = 0.1;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start();
    }

    // Play data transmission sound
    playDataPulse() {
        if (!this.isInitialized || this.isMuted) return;

        const steps = 3 + Math.floor(Math.random() * 4);
        const baseFreq = 1200 + Math.random() * 800;

        for (let i = 0; i < steps; i++) {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = baseFreq + (i * 100);

                const gain = this.audioContext.createGain();
                gain.gain.setValueAtTime(0.03, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start();
                osc.stop(this.audioContext.currentTime + 0.05);
            }, i * 40);
        }
    }

    startGlitchEffects() {
        this.glitchInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                this.playGlitch();
            }
        }, 3000 + Math.random() * 5000);
    }

    startAmbientBeeps() {
        this.ambientInterval = setInterval(() => {
            if (Math.random() > 0.5) {
                this.playDataPulse();
            }
        }, 4000 + Math.random() * 6000);
    }

    setVolume(value) {
        this.volume = value;
        if (this.masterGain && !this.isMuted) {
            this.masterGain.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.1);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(
                this.isMuted ? 0 : this.volume,
                this.audioContext.currentTime,
                0.1
            );
        }
        return this.isMuted;
    }

    stop() {
        if (this.glitchInterval) clearInterval(this.glitchInterval);
        if (this.ambientInterval) clearInterval(this.ambientInterval);

        this.drones.forEach(d => {
            d.osc.stop();
            d.lfo.stop();
        });

        if (this.noiseSource) {
            this.noiseSource.noise.stop();
        }

        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
