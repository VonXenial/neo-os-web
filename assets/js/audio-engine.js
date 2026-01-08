class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.master.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        this.loops = [];
        this.tempo = 120;
        this.isPlaying = false;
    }

    setVolume(v) { this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1); }

    stopAll() {
        this.loops.forEach(l => clearInterval(l));
        this.loops = [];
    }

    startThemeMusic(t) {
        this.stopAll();
        this.ctx.resume();

        if (t === 'netrunner') this.seqNetrunner();
        else if (t === 'corp') this.seqCorp();
        else this.seqNomad();
    }

    // Schedulers
    seqNetrunner() { // Trance 120BPM
        const beat = 60000 / 120;
        this.loops.push(setInterval(() => {
            this.playKick(150, 0.5); // 4/4 Kick
            setTimeout(() => this.playHat(), beat / 2); // Offbeat Hat
        }, beat));

        // Arp
        this.loops.push(setInterval(() => {
            const f = [440, 523, 659][Math.floor(Math.random() * 3)];
            this.playTone(f, 'sine', 0.1, 0.2);
        }, beat / 2));
    }

    // RE-TUNED ARASAKA AUDIO
    // User Feedback: "Painful, too saturated."
    // Fix: Using Filtering, darker tones, and rhythmic drive instead of noise.
    seqCorp() {
        const beat = 60000 / 110;

        // Dark Techno Kick (Deep, not distorted)
        this.loops.push(setInterval(() => {
            this.playDeepKick();
            // Double tap rhythm for aggression
            setTimeout(() => this.playDeepKick(0.6), beat * 0.75);
        }, beat)); // 110 BPM

        // Filtered Bass Pulse (The "Menace")
        // Uses Low Pass Filter to remove painful highs
        this.loops.push(setInterval(() => {
            this.playBassPulse();
        }, beat / 2));

        // Metallic Click (Clean, precise)
        this.loops.push(setInterval(() => {
            if (Math.random() > 0.5) this.playMetallicClick();
        }, beat / 4));
    }

    seqNomad() { // Synthwave 90BPM
        const beat = 60000 / 90;
        this.loops.push(setInterval(() => {
            this.playKick(100, 0.6);
            setTimeout(() => this.playSnare(), beat); // Backbeat
        }, beat * 2));

        this.loops.push(setInterval(() => {
            this.playTone(220 + Math.random() * 20, 'triangle', 0.1, 0.5); // Pad
        }, beat * 4));
    }

    // Instruments
    playKick(freq = 150, vol = 1, type = 'sine') {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.connect(g).connect(this.master);
        osc.start(); osc.stop(t + 0.5);
    }

    // New Deep Kick for Arasaka
    playDeepKick(vol = 0.8) {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.3);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        // Add subtle saturation via compression curve? No, simple gain is safer for "smooth".
        osc.connect(g).connect(this.master);
        osc.start(); osc.stop(t + 0.3);
    }

    // New Filtered Bass
    playBassPulse() {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = 65; // Low F

        filter.type = 'lowpass';
        filter.frequency.value = 400; // This cuts the "painful" screech
        filter.Q.value = 5; // Resonant peak for "club" feel

        g.gain.setValueAtTime(0.2, t);
        g.gain.linearRampToValueAtTime(0, t + 0.2);

        osc.connect(filter).connect(g).connect(this.master);
        osc.start(); osc.stop(t + 0.2);
    }

    // New Metallic Click
    playMetallicClick() {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2000, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.connect(g).connect(this.master);
        osc.start(); osc.stop(t + 0.05);
    }

    // START SCREEN AMBIENT
    playStartAmbient() {
        this.ctx.resume();
        this.stopAll();

        // Soft Drone Pad
        const createDrone = (freq, pan) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            const p = this.ctx.createStereoPanner();
            const f = this.ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.value = freq;

            f.type = 'lowpass';
            f.frequency.value = 200; // Muffled

            p.pan.value = pan;

            g.gain.value = 0.05;

            // LFO for filter movement
            const lfo = this.ctx.createOscillator();
            lfo.frequency.value = 0.1;
            const lfoOp = this.ctx.createGain();
            lfoOp.gain.value = 50;
            lfo.connect(lfoOp).connect(f.frequency);
            lfo.start();

            osc.connect(f).connect(p).connect(g).connect(this.master);
            osc.start();

            this.loops.push(setInterval(() => {
                // Keep references if needed, or just clear all on stop
            }, 1000));

            // Track for cleanup
            if (!this.drones) this.drones = [];
            this.drones.push([osc, lfo]);
        };

        createDrone(110, -0.3); // A2
        createDrone(164.8, 0.3); // E3
        createDrone(130.8, 0); // C3
    }

    stopAll() {
        this.loops.forEach(l => clearInterval(l));
        this.loops = [];
        if (this.drones) {
            this.drones.forEach(pair => pair.forEach(n => {
                try { n.stop(); n.disconnect(); } catch (e) { }
            }));
            this.drones = [];
        }
    }

    playSnare() {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle'; // simplified noise
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.connect(g).connect(this.master);
        osc.start(); osc.stop(t + 0.2);
    }

    playHat() {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 8000;
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.connect(g).connect(this.master);
        osc.start(); osc.stop(t + 0.05);
    }

    playTone(f, type, vol, dur) {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type; osc.frequency.value = f;
        g.gain.setValueAtTime(vol, t);
        g.gain.linearRampToValueAtTime(0, t + dur);
        osc.connect(g).connect(this.master);
        osc.start(); osc.stop(t + dur);
    }

    playTyping(theme) {
        if (theme === 'netrunner') this.playTone(1200, 'sine', 0.05, 0.05);
        else if (theme === 'corp') this.playTone(4000, 'sawtooth', 0.02, 0.02);
        else this.playTone(300, 'square', 0.05, 0.05);
    }
}
