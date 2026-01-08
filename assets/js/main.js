// Imports removed for file:// protocol support
// Libraries loaded via <script> tags in index.html

// Global audio instance
const cyberAudio = new CyberpunkAudio();

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Background
    initCityBackground();

    // Audio Controls Initialization
    const overlay = document.getElementById('audio-start-overlay');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const vizBars = document.querySelectorAll('.viz-bar');

    // Initialize audio on overlay click
    if (overlay) {
        overlay.addEventListener('click', async () => {
            await cyberAudio.init();
            overlay.classList.add('hidden');

            // Play startup sound
            setTimeout(() => cyberAudio.playBeep('success'), 200);
            setTimeout(() => cyberAudio.playDataPulse(), 500);
        });
    }

    // Mute button
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            const muted = cyberAudio.toggleMute();
            muteBtn.textContent = muted ? '🔇' : '🔊';
            muteBtn.classList.toggle('muted', muted);
        });
    }

    // Volume slider
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            cyberAudio.setVolume(value);
        });
    }

    // Animate visualizer
    const animateVisualizer = () => {
        if (vizBars.length) {
            vizBars.forEach((bar, i) => {
                const height = cyberAudio.isMuted ? 2 : 4 + Math.sin(Date.now() * 0.005 + i) * 8 + Math.random() * 6;
                bar.style.height = `${height}px`;
            });
        }
        requestAnimationFrame(animateVisualizer);
    };
    animateVisualizer();
});


// ==== OLD LEGACY ANIMATIONS (To be refactored into Game Logic later) ====
// For now, we keep the original text typing simulation to maintain 1:1 parity during refactor

const logLines = [
    { text: "> Scanning neural lace integrity... ✓", sound: "success" },
    { text: "> Firewall bypassed (Layer 5) — access granted", sound: "info" },
    { text: "> Decrypting payload [██████░░░░] 68%", sound: "info" },
    { text: "> Warning: ICE detected — CorpSec v4.2 inbound", sound: "warning" },
    { text: "> Deploying countermeasures: Ghost Protocol active", sound: "success" },
    { text: "> Memory dump recovered: ./fragment_δ7.enc", sound: "info" },
    { text: "> Signal anomaly in Sector Θ — triangulating...", sound: "warning" },
    { text: "> User authentication: biometric override accepted", sound: "success" },
    { text: "> Quantum tunnel stabilized — latency: 12ms", sound: "info" },
    { text: "> System alert: Black ICE neutralized", sound: "success" }
];

const logEl = document.getElementById('log');
if (logEl) {
    logLines.forEach((line, i) => {
        const div = document.createElement('div');
        div.className = 'line';
        div.textContent = `[${String(i + 1).padStart(2, '0')}] ${line.text}`;
        logEl.appendChild(div);
        setTimeout(() => {
            div.classList.add('active');
            // Play sound effect for each log line
            if (cyberAudio.isInitialized) {
                cyberAudio.playBeep(line.sound);
            }
        }, i * 600 + 500);
    });
}

// Simulación de barras
const cpuBar = document.getElementById('cpu-bar');
const memBar = document.getElementById('mem-bar');
const netBar = document.getElementById('net-bar');
const threatBar = document.getElementById('threat-bar');

const animateBars = () => {
    if (!cpuBar) return; // Safety check

    const cpu = 65 + Math.sin(Date.now() * 0.001) * 15;
    const mem = 45 + Math.sin(Date.now() * 0.0007) * 20;
    const net = 70 + Math.sin(Date.now() * 0.002) * 25;
    const threat = 30 + Math.abs(Math.sin(Date.now() * 0.0005)) * 40;

    cpuBar.style.width = `${Math.max(30, cpu)}%`;
    memBar.style.width = `${Math.max(20, mem)}%`;
    netBar.style.width = `${Math.max(25, net)}%`;
    threatBar.style.width = `${threat}%`;

    const cpuVal = document.getElementById('cpu-val');
    const memVal = document.getElementById('mem-val');
    const netVal = document.getElementById('net-val');
    const threatVal = document.getElementById('threat-val');

    if (cpuVal) cpuVal.textContent = `${cpu.toFixed(0)}%`;
    if (memVal) memVal.textContent = `${(mem * 128 / 100).toFixed(1)}/128 GB`;
    if (netVal) netVal.textContent = `↓ ${(1.2 + Math.random() * 0.5).toFixed(1)} Gbps | ↑ ${(0.7 + Math.random() * 0.3).toFixed(1)} Gbps`;
    if (threatVal) threatVal.textContent = threat > 60 ? 'HIGH' : threat > 30 ? 'MEDIUM' : 'LOW';

    requestAnimationFrame(animateBars);
};
animateBars();
