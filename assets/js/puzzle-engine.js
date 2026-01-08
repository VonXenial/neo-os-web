/**
 * NEO-OS Puzzle Engine v2.0
 * 6 nuevos puzzles con dificultad aleatoria y animaciones
 */

class PuzzleEngine {
    constructor(core) {
        this.core = core;
        this.activePuzzle = null;
        this.difficulty = 1;
        this.callbacks = { onSuccess: null, onFail: null };
    }

    // Genera dificultad aleatoria 1-5
    randomDifficulty() {
        this.difficulty = Math.floor(Math.random() * 5) + 1;
        return this.difficulty;
    }

    // Muestra indicador de nivel
    showLevelIndicator(container) {
        const indicator = document.createElement('div');
        indicator.className = 'puzzle-level-indicator';
        indicator.innerHTML = `<span class="level-label">${this.core.t('pzl_level') || 'LEVEL'}</span> <span class="level-value">${this.difficulty}</span>`;
        container.prepend(indicator);
    }

    // Animación de entrada
    animateIn(element) {
        element.classList.remove('hidden');
        element.classList.add('puzzle-enter');
        setTimeout(() => element.classList.remove('puzzle-enter'), 500);
    }

    // Animación de salida
    animateOut(element, callback) {
        element.classList.add('puzzle-exit');
        setTimeout(() => {
            element.classList.add('hidden');
            element.classList.remove('puzzle-exit');
            if (callback) callback();
        }, 400);
    }

    // Efecto de éxito
    showSuccess(container) {
        const overlay = document.createElement('div');
        overlay.className = 'puzzle-success-overlay';
        overlay.innerHTML = `<div class="success-text">${this.core.t('pzl_success') || 'SYSTEM BYPASSED'}</div>`;
        container.appendChild(overlay);
        audio.playTone(800, 'sine', 0.2, 0.3);
        setTimeout(() => audio.playTone(1000, 'sine', 0.2, 0.3), 150);
    }

    // Efecto de fallo
    showFail(container) {
        const overlay = document.createElement('div');
        overlay.className = 'puzzle-fail-overlay';
        overlay.innerHTML = `<div class="fail-text">${this.core.t('pzl_fail') || 'ACCESS DENIED'}</div>`;
        container.appendChild(overlay);
        audio.playTone(200, 'sawtooth', 0.3, 0.5);
    }

    // Limpia puzzle activo
    cleanup() {
        if (this.activePuzzle && this.activePuzzle.cleanup) {
            this.activePuzzle.cleanup();
        }
        this.activePuzzle = null;
    }
}

// ===============================================
// NETRUNNER PUZZLES
// ===============================================

/**
 * Packet Decryptor - Haz clic en el símbolo hex correcto
 */
class PacketDecryptorPuzzle {
    constructor(engine, container) {
        this.engine = engine;
        this.container = container;
        this.symbols = ['1C', '55', 'BD', 'E9', '7A', 'FF', '00', 'A3', '8B', 'C7'];
        this.targetSequence = [];
        this.currentIndex = 0;
        this.interval = null;
        this.timer = null;
    }

    start() {
        const diff = this.engine.randomDifficulty();
        this.container.innerHTML = '';
        this.engine.animateIn(this.container);

        // Título
        const title = document.createElement('div');
        title.className = 'puzzle-title net-theme';
        title.innerHTML = `<h3>${this.engine.core.t('pzl_decrypt_title') || 'PACKET DECRYPTOR'}</h3>
                          <p class="puzzle-hint">${this.engine.core.t('pzl_decrypt_hint') || 'Click the correct hex before it fades'}</p>`;
        this.container.appendChild(title);

        this.engine.showLevelIndicator(this.container);

        // Generar secuencia objetivo
        const seqLength = 3 + diff;
        this.targetSequence = [];
        for (let i = 0; i < seqLength; i++) {
            this.targetSequence.push(this.symbols[Math.floor(Math.random() * this.symbols.length)]);
        }

        // Mostrar secuencia objetivo
        const targetDisplay = document.createElement('div');
        targetDisplay.className = 'decrypt-target';
        targetDisplay.innerHTML = `<span class="label">TARGET:</span> ${this.targetSequence.map((s, i) =>
            `<span class="hex-target" id="hex-target-${i}">${s}</span>`).join(' ')}`;
        this.container.appendChild(targetDisplay);

        // Grid de símbolos
        const grid = document.createElement('div');
        grid.className = 'decrypt-grid';
        grid.id = 'decrypt-grid';
        this.container.appendChild(grid);

        // Contador de progreso
        const progress = document.createElement('div');
        progress.className = 'decrypt-progress';
        progress.id = 'decrypt-progress';
        progress.innerText = `0 / ${seqLength}`;
        this.container.appendChild(progress);

        this.currentIndex = 0;
        this.spawnSymbols(diff);
    }

    spawnSymbols(diff) {
        const grid = document.getElementById('decrypt-grid');
        if (!grid) return;

        grid.innerHTML = '';
        const symbolCount = 6 + diff * 2;
        const fadeTime = Math.max(800, 2000 - diff * 300);

        // Incluir el símbolo correcto
        const correctSymbol = this.targetSequence[this.currentIndex];
        const positions = [];

        for (let i = 0; i < symbolCount; i++) {
            positions.push(i === 0 ? correctSymbol : this.symbols[Math.floor(Math.random() * this.symbols.length)]);
        }

        // Mezclar
        positions.sort(() => Math.random() - 0.5);

        positions.forEach((sym, idx) => {
            const cell = document.createElement('div');
            cell.className = 'decrypt-cell';
            cell.innerText = sym;
            cell.style.animationDuration = `${fadeTime}ms`;
            cell.onclick = () => this.handleClick(sym);
            grid.appendChild(cell);
        });

        // Auto-fail si no hace clic a tiempo
        this.timer = setTimeout(() => {
            this.fail();
        }, fadeTime + 500);
    }

    handleClick(symbol) {
        clearTimeout(this.timer);

        if (symbol === this.targetSequence[this.currentIndex]) {
            // Correcto
            audio.playTone(600 + this.currentIndex * 100, 'sine', 0.1, 0.1);
            document.getElementById(`hex-target-${this.currentIndex}`).classList.add('matched');
            this.currentIndex++;

            document.getElementById('decrypt-progress').innerText =
                `${this.currentIndex} / ${this.targetSequence.length}`;

            if (this.currentIndex >= this.targetSequence.length) {
                this.success();
            } else {
                this.spawnSymbols(this.engine.difficulty);
            }
        } else {
            // Incorrecto
            this.fail();
        }
    }

    success() {
        this.engine.showSuccess(this.container);
        setTimeout(() => {
            this.engine.animateOut(this.container, () => {
                this.engine.core.log(this.engine.core.theme, 'PACKETS DECRYPTED. DATA EXTRACTED.', false);
                this.engine.core.securityLevel++;
            });
        }, 1500);
    }

    fail() {
        this.engine.showFail(this.container);
        this.engine.core.triggerAlarm(this.engine.core.theme);
        setTimeout(() => {
            this.engine.animateOut(this.container);
        }, 2000);
    }

    cleanup() {
        clearTimeout(this.timer);
        clearInterval(this.interval);
    }
}

/**
 * Memory Sync - Memoriza y replica patrón (Simon Says)
 */
class MemorySyncPuzzle {
    constructor(engine, container) {
        this.engine = engine;
        this.container = container;
        this.sequence = [];
        this.playerSeq = [];
        this.cells = [];
        this.showingPattern = false;
    }

    start() {
        const diff = this.engine.randomDifficulty();
        this.container.innerHTML = '';
        this.engine.animateIn(this.container);

        const title = document.createElement('div');
        title.className = 'puzzle-title net-theme';
        title.innerHTML = `<h3>${this.engine.core.t('pzl_sync_title') || 'NEURAL SYNC'}</h3>
                          <p class="puzzle-hint">${this.engine.core.t('pzl_sync_hint') || 'Memorize the pattern, then replicate it'}</p>`;
        this.container.appendChild(title);

        this.engine.showLevelIndicator(this.container);

        // Crear grid 3x3
        const grid = document.createElement('div');
        grid.className = 'memory-grid';
        this.cells = [];

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'memory-cell';
            cell.dataset.index = i;
            cell.onclick = () => this.handleCellClick(i);
            grid.appendChild(cell);
            this.cells.push(cell);
        }
        this.container.appendChild(grid);

        // Generar secuencia
        const seqLength = 3 + diff;
        this.sequence = [];
        for (let i = 0; i < seqLength; i++) {
            this.sequence.push(Math.floor(Math.random() * 9));
        }

        // Status
        const status = document.createElement('div');
        status.className = 'memory-status';
        status.id = 'memory-status';
        status.innerText = 'WATCH...';
        this.container.appendChild(status);

        this.playerSeq = [];
        setTimeout(() => this.showPattern(diff), 1000);
    }

    showPattern(diff) {
        this.showingPattern = true;
        const speed = Math.max(300, 600 - diff * 80);
        let i = 0;

        const show = () => {
            if (i > 0) this.cells[this.sequence[i - 1]].classList.remove('active');
            if (i < this.sequence.length) {
                this.cells[this.sequence[i]].classList.add('active');
                audio.playTone(400 + this.sequence[i] * 50, 'sine', 0.1, 0.1);
                i++;
                setTimeout(show, speed);
            } else {
                this.showingPattern = false;
                document.getElementById('memory-status').innerText = 'YOUR TURN...';
            }
        };
        show();
    }

    handleCellClick(index) {
        if (this.showingPattern) return;

        this.cells[index].classList.add('player-active');
        setTimeout(() => this.cells[index].classList.remove('player-active'), 200);

        audio.playTone(400 + index * 50, 'triangle', 0.1, 0.1);
        this.playerSeq.push(index);

        // Verificar
        const currentIndex = this.playerSeq.length - 1;
        if (this.playerSeq[currentIndex] !== this.sequence[currentIndex]) {
            this.fail();
            return;
        }

        if (this.playerSeq.length === this.sequence.length) {
            this.success();
        }
    }

    success() {
        this.engine.showSuccess(this.container);
        setTimeout(() => {
            this.engine.animateOut(this.container, () => {
                this.engine.core.log(this.engine.core.theme, 'NEURAL LINK SYNCHRONIZED.', false);
                this.engine.core.securityLevel++;
            });
        }, 1500);
    }

    fail() {
        this.engine.showFail(this.container);
        this.engine.core.triggerAlarm(this.engine.core.theme);
        setTimeout(() => {
            this.engine.animateOut(this.container);
        }, 2000);
    }

    cleanup() { }
}

// ===============================================
// ARASAKA PUZZLES
// ===============================================

/**
 * Target Lock - Mantén el cursor sobre el objetivo
 */
class TargetLockPuzzle {
    constructor(engine, container) {
        this.engine = engine;
        this.container = container;
        this.targets = [];
        this.lockProgress = 0;
        this.animFrame = null;
        this.isLocking = false;
    }

    start() {
        const diff = this.engine.randomDifficulty();
        this.container.innerHTML = '';
        this.engine.animateIn(this.container);

        const title = document.createElement('div');
        title.className = 'puzzle-title corp-theme';
        title.innerHTML = `<h3>${this.engine.core.t('pzl_lock_title') || 'TARGET LOCK'}</h3>
                          <p class="puzzle-hint">${this.engine.core.t('pzl_lock_hint') || 'Hold cursor on target to lock'}</p>`;
        this.container.appendChild(title);

        this.engine.showLevelIndicator(this.container);

        // Arena
        const arena = document.createElement('div');
        arena.className = 'target-arena';
        arena.id = 'target-arena';
        this.container.appendChild(arena);

        // Barra de progreso
        const progressBar = document.createElement('div');
        progressBar.className = 'target-progress-bar';
        progressBar.innerHTML = '<div class="target-progress-fill" id="target-progress"></div>';
        this.container.appendChild(progressBar);

        // Crear objetivo
        const target = document.createElement('div');
        target.className = 'target-hostile';
        target.id = 'target-main';
        target.innerHTML = '◎';
        arena.appendChild(target);

        this.lockProgress = 0;
        this.isLocking = false;

        // Movimiento del objetivo
        const speed = 1 + diff * 0.5;
        let angle = 0;
        let radius = 80;

        const moveTarget = () => {
            angle += 0.02 * speed;
            const x = Math.cos(angle) * radius + (arena.offsetWidth / 2) - 25;
            const y = Math.sin(angle * 1.5) * (radius * 0.6) + (arena.offsetHeight / 2) - 25;
            target.style.left = x + 'px';
            target.style.top = y + 'px';

            if (this.isLocking) {
                this.lockProgress += 0.5;
                document.getElementById('target-progress').style.width = this.lockProgress + '%';

                if (this.lockProgress >= 100) {
                    this.success();
                    return;
                }
            } else if (this.lockProgress > 0) {
                this.lockProgress -= 0.3;
                document.getElementById('target-progress').style.width = this.lockProgress + '%';
            }

            this.animFrame = requestAnimationFrame(moveTarget);
        };

        target.onmouseenter = () => { this.isLocking = true; };
        target.onmouseleave = () => { this.isLocking = false; };

        this.animFrame = requestAnimationFrame(moveTarget);

        // Timeout
        setTimeout(() => {
            if (this.lockProgress < 100) {
                this.fail();
            }
        }, 8000 + (5 - diff) * 1000);
    }

    success() {
        cancelAnimationFrame(this.animFrame);
        this.engine.showSuccess(this.container);
        setTimeout(() => {
            this.engine.animateOut(this.container, () => {
                this.engine.core.log(this.engine.core.theme, 'TARGET ACQUIRED. WEAPONS HOT.', false);
                this.engine.core.securityLevel++;
            });
        }, 1500);
    }

    fail() {
        cancelAnimationFrame(this.animFrame);
        this.engine.showFail(this.container);
        this.engine.core.triggerAlarm(this.engine.core.theme);
        setTimeout(() => {
            this.engine.animateOut(this.container);
        }, 2000);
    }

    cleanup() {
        cancelAnimationFrame(this.animFrame);
    }
}

/**
 * Auth Bypass - Alinea los anillos giratorios
 */
class AuthBypassPuzzle {
    constructor(engine, container) {
        this.engine = engine;
        this.container = container;
        this.rings = [];
        this.animFrame = null;
        this.locked = [];
    }

    start() {
        const diff = this.engine.randomDifficulty();
        this.container.innerHTML = '';
        this.engine.animateIn(this.container);

        const title = document.createElement('div');
        title.className = 'puzzle-title corp-theme';
        title.innerHTML = `<h3>${this.engine.core.t('pzl_auth_title') || 'AUTH BYPASS'}</h3>
                          <p class="puzzle-hint">${this.engine.core.t('pzl_auth_hint') || 'Click when the gaps align'}</p>`;
        this.container.appendChild(title);

        this.engine.showLevelIndicator(this.container);

        // Lock display
        const lockContainer = document.createElement('div');
        lockContainer.className = 'auth-lock-container';
        lockContainer.id = 'auth-lock-container';
        this.container.appendChild(lockContainer);

        // Crear anillos
        const ringCount = 2 + Math.floor(diff / 2);
        this.rings = [];
        this.locked = [];

        for (let i = 0; i < ringCount; i++) {
            const ring = document.createElement('div');
            ring.className = 'auth-ring';
            ring.style.width = (180 - i * 30) + 'px';
            ring.style.height = (180 - i * 30) + 'px';
            ring.dataset.index = i;
            ring.innerHTML = '<div class="ring-gap"></div>';
            lockContainer.appendChild(ring);

            this.rings.push({
                element: ring,
                angle: Math.random() * 360,
                speed: (0.5 + Math.random() * 0.5) * (i % 2 === 0 ? 1 : -1) * (1 + diff * 0.2),
                locked: false
            });
            this.locked.push(false);
        }

        // Centro clickeable
        const center = document.createElement('div');
        center.className = 'auth-center';
        center.innerHTML = '◉';
        center.onclick = () => this.attemptLock();
        lockContainer.appendChild(center);

        // Status
        const status = document.createElement('div');
        status.className = 'auth-status';
        status.id = 'auth-status';
        status.innerText = 'ALIGNING...';
        this.container.appendChild(status);

        this.animate();
    }

    animate() {
        this.rings.forEach((r, i) => {
            if (!r.locked) {
                r.angle += r.speed;
                r.element.style.transform = `rotate(${r.angle}deg)`;
            }
        });
        this.animFrame = requestAnimationFrame(() => this.animate());
    }

    attemptLock() {
        // El primero no bloqueado
        const idx = this.rings.findIndex(r => !r.locked);
        if (idx === -1) return;

        const ring = this.rings[idx];
        const angle = ring.angle % 360;

        // ¿Está el gap cerca de arriba (0°)?
        if (angle < 20 || angle > 340) {
            ring.locked = true;
            ring.element.classList.add('ring-locked');
            audio.playTone(600 + idx * 100, 'sine', 0.1, 0.1);

            // ¿Todos bloqueados?
            if (this.rings.every(r => r.locked)) {
                this.success();
            }
        } else {
            this.fail();
        }
    }

    success() {
        cancelAnimationFrame(this.animFrame);
        document.getElementById('auth-status').innerText = 'ACCESS GRANTED';
        this.engine.showSuccess(this.container);
        setTimeout(() => {
            this.engine.animateOut(this.container, () => {
                this.engine.core.log(this.engine.core.theme, 'BIOMETRIC BYPASS COMPLETE.', false);
                this.engine.core.securityLevel++;
            });
        }, 1500);
    }

    fail() {
        cancelAnimationFrame(this.animFrame);
        this.engine.showFail(this.container);
        this.engine.core.triggerAlarm(this.engine.core.theme);
        setTimeout(() => {
            this.engine.animateOut(this.container);
        }, 2000);
    }

    cleanup() {
        cancelAnimationFrame(this.animFrame);
    }
}

// ===============================================
// NOMAD PUZZLES
// ===============================================

/**
 * Engine Sync - Presiona SPACE en la zona verde
 */
class EngineSyncPuzzle {
    constructor(engine, container) {
        this.engine = engine;
        this.container = container;
        this.animFrame = null;
        this.syncsRequired = 3;
        this.syncsCompleted = 0;
    }

    start() {
        const diff = this.engine.randomDifficulty();
        this.container.innerHTML = '';
        this.engine.animateIn(this.container);

        const title = document.createElement('div');
        title.className = 'puzzle-title nomad-theme';
        title.innerHTML = `<h3>${this.engine.core.t('pzl_engine_title') || 'ENGINE SYNC'}</h3>
                          <p class="puzzle-hint">${this.engine.core.t('pzl_engine_hint') || 'Press SPACE when needle is in the green zone'}</p>`;
        this.container.appendChild(title);

        this.engine.showLevelIndicator(this.container);

        // Gauge container
        const gauge = document.createElement('div');
        gauge.className = 'engine-gauge';
        gauge.innerHTML = `
            <div class="gauge-bar">
                <div class="gauge-zone" id="gauge-zone"></div>
                <div class="gauge-needle" id="gauge-needle"></div>
            </div>
        `;
        this.container.appendChild(gauge);

        // Ajustar zona verde según dificultad
        const zoneSize = Math.max(10, 30 - diff * 4);
        const zone = document.getElementById('gauge-zone');
        zone.style.width = zoneSize + '%';
        zone.style.left = (50 - zoneSize / 2) + '%';

        // Progress
        this.syncsRequired = 2 + diff;
        this.syncsCompleted = 0;

        const progress = document.createElement('div');
        progress.className = 'engine-progress';
        progress.id = 'engine-progress';
        progress.innerText = `SYNCS: 0 / ${this.syncsRequired}`;
        this.container.appendChild(progress);

        // Movimiento de aguja
        const needle = document.getElementById('gauge-needle');
        let position = 0;
        let direction = 1;
        const speed = 1.5 + diff * 0.5;

        const animate = () => {
            position += direction * speed;
            if (position >= 100 || position <= 0) direction *= -1;
            needle.style.left = position + '%';
            this.animFrame = requestAnimationFrame(animate);
        };
        animate();

        // Listener de teclado
        this.handler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.checkSync(position, zoneSize);
            }
        };
        document.addEventListener('keydown', this.handler);
    }

    checkSync(position, zoneSize) {
        const zoneStart = 50 - zoneSize / 2;
        const zoneEnd = 50 + zoneSize / 2;

        if (position >= zoneStart && position <= zoneEnd) {
            this.syncsCompleted++;
            audio.playTone(500 + this.syncsCompleted * 100, 'triangle', 0.1, 0.2);
            document.getElementById('engine-progress').innerText =
                `SYNCS: ${this.syncsCompleted} / ${this.syncsRequired}`;

            if (this.syncsCompleted >= this.syncsRequired) {
                this.success();
            }
        } else {
            this.fail();
        }
    }

    success() {
        cancelAnimationFrame(this.animFrame);
        document.removeEventListener('keydown', this.handler);
        this.engine.showSuccess(this.container);
        setTimeout(() => {
            this.engine.animateOut(this.container, () => {
                this.engine.core.log(this.engine.core.theme, 'ENGINE SYNCHRONIZED. RPM OPTIMAL.', false);
                this.engine.core.securityLevel++;
            });
        }, 1500);
    }

    fail() {
        cancelAnimationFrame(this.animFrame);
        document.removeEventListener('keydown', this.handler);
        this.engine.showFail(this.container);
        this.engine.core.triggerAlarm(this.engine.core.theme);
        setTimeout(() => {
            this.engine.animateOut(this.container);
        }, 2000);
    }

    cleanup() {
        cancelAnimationFrame(this.animFrame);
        document.removeEventListener('keydown', this.handler);
    }
}

/**
 * Signal Scrambler - Ajusta frecuencia y ganancia
 */
class SignalScramblerPuzzle {
    constructor(engine, container) {
        this.engine = engine;
        this.container = container;
        this.targetFreq = 0;
        this.targetGain = 0;
        this.userFreq = 50;
        this.userGain = 50;
        this.animFrame = null;
    }

    start() {
        const diff = this.engine.randomDifficulty();
        this.container.innerHTML = '';
        this.engine.animateIn(this.container);

        const title = document.createElement('div');
        title.className = 'puzzle-title nomad-theme';
        title.innerHTML = `<h3>${this.engine.core.t('pzl_scramble_title') || 'SIGNAL DECODER'}</h3>
                          <p class="puzzle-hint">${this.engine.core.t('pzl_scramble_hint') || 'Use ←→↑↓ to tune frequency and gain'}</p>`;
        this.container.appendChild(title);

        this.engine.showLevelIndicator(this.container);

        // Target aleatorio
        this.targetFreq = 20 + Math.random() * 60;
        this.targetGain = 20 + Math.random() * 60;
        this.userFreq = 50;
        this.userGain = 50;

        // Canvas para waveform
        const canvas = document.createElement('canvas');
        canvas.id = 'signal-canvas';
        canvas.width = 400;
        canvas.height = 150;
        canvas.className = 'signal-canvas';
        this.container.appendChild(canvas);

        // Controles
        const controls = document.createElement('div');
        controls.className = 'signal-controls';
        controls.innerHTML = `
            <div class="signal-slider">
                <span>FREQ:</span>
                <span id="freq-value">${Math.floor(this.userFreq)}</span>
            </div>
            <div class="signal-slider">
                <span>GAIN:</span>
                <span id="gain-value">${Math.floor(this.userGain)}</span>
            </div>
        `;
        this.container.appendChild(controls);

        // Status
        const status = document.createElement('div');
        status.className = 'signal-status';
        status.id = 'signal-status';
        status.innerText = 'SEARCHING...';
        this.container.appendChild(status);

        // Tolerancia según dificultad
        this.tolerance = Math.max(5, 20 - diff * 3);

        this.handler = (e) => {
            if (e.key === 'ArrowLeft') this.userFreq = Math.max(0, this.userFreq - 2);
            if (e.key === 'ArrowRight') this.userFreq = Math.min(100, this.userFreq + 2);
            if (e.key === 'ArrowUp') this.userGain = Math.min(100, this.userGain + 2);
            if (e.key === 'ArrowDown') this.userGain = Math.max(0, this.userGain - 2);

            document.getElementById('freq-value').innerText = Math.floor(this.userFreq);
            document.getElementById('gain-value').innerText = Math.floor(this.userGain);
        };
        document.addEventListener('keydown', this.handler);

        this.animate(canvas, diff);
    }

    animate(canvas, diff) {
        const ctx = canvas.getContext('2d');
        const freqDiff = Math.abs(this.userFreq - this.targetFreq);
        const gainDiff = Math.abs(this.userGain - this.targetGain);
        const clarity = 100 - (freqDiff + gainDiff) / 2;

        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar waveform con ruido
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 184, 51, ${0.3 + clarity * 0.007})`;
        ctx.lineWidth = 2;

        for (let x = 0; x < canvas.width; x++) {
            const noise = (100 - clarity) * (Math.random() - 0.5) * 0.5;
            const signal = Math.sin(x * (this.userFreq / 500) + Date.now() * 0.003) * (30 + this.userGain * 0.3);
            const y = 75 + signal + noise;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Verificar si está sincronizado
        if (freqDiff < this.tolerance && gainDiff < this.tolerance) {
            document.getElementById('signal-status').innerText = 'SIGNAL LOCKED!';
            document.getElementById('signal-status').style.color = '#00ff00';

            if (!this.lockTimer) {
                this.lockTimer = setTimeout(() => this.success(), 2000);
            }
        } else {
            document.getElementById('signal-status').innerText = 'SEARCHING...';
            document.getElementById('signal-status').style.color = '#ffb833';
            clearTimeout(this.lockTimer);
            this.lockTimer = null;
        }

        this.animFrame = requestAnimationFrame(() => this.animate(canvas, diff));
    }

    success() {
        cancelAnimationFrame(this.animFrame);
        document.removeEventListener('keydown', this.handler);
        this.engine.showSuccess(this.container);
        setTimeout(() => {
            this.engine.animateOut(this.container, () => {
                this.engine.core.log(this.engine.core.theme, 'SIGNAL DECODED. INTEL RECEIVED.', false);
                this.engine.core.securityLevel++;
            });
        }, 1500);
    }

    fail() {
        cancelAnimationFrame(this.animFrame);
        document.removeEventListener('keydown', this.handler);
        this.engine.showFail(this.container);
        setTimeout(() => {
            this.engine.animateOut(this.container);
        }, 2000);
    }

    cleanup() {
        cancelAnimationFrame(this.animFrame);
        clearTimeout(this.lockTimer);
        document.removeEventListener('keydown', this.handler);
    }
}

// Export para uso global
window.PuzzleEngine = PuzzleEngine;
window.PacketDecryptorPuzzle = PacketDecryptorPuzzle;
window.MemorySyncPuzzle = MemorySyncPuzzle;
window.TargetLockPuzzle = TargetLockPuzzle;
window.AuthBypassPuzzle = AuthBypassPuzzle;
window.EngineSyncPuzzle = EngineSyncPuzzle;
window.SignalScramblerPuzzle = SignalScramblerPuzzle;
