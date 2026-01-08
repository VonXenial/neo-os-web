const MISSIONS = {
    netrunner: {
        id: 'net_ghost',
        title: 'OPERATION: GHOST PROTOCOL',
        steps: [
            { cmd: 'scan', hint: 'm_net_s1_h', success: 'm_net_s1_s' },
            { cmd: 'breach', hint: 'm_net_s2_h', success: 'm_net_s2_s' },
            { cmd: 'trace', hint: 'm_net_s3_h', success: 'm_net_s3_s' },
            { cmd: 'upload', hint: 'm_net_s4_h', success: 'm_net_s4_s' }
        ]
    },
    corp: {
        id: 'corp_purge',
        title: 'OPERATION: CLEAN_SWEEP',
        steps: [
            { cmd: 'tactical scan', hint: 'm_corp_s1_h', success: 'm_corp_s1_s' },
            { cmd: 'override', hint: 'm_corp_s2_h', success: 'm_corp_s2_s' },
            { cmd: 'deploy', hint: 'm_corp_s3_h', success: 'm_corp_s3_s' },
            { cmd: 'purge', hint: 'm_corp_s4_h', success: 'm_corp_s4_s' }
        ]
    },
    nomad: {
        id: 'nomad_run',
        title: 'JOB: BORDER RUN',
        steps: [
            { cmd: 'boot', hint: 'm_nomad_s1_h', success: 'm_nomad_s1_s' },
            { cmd: 'tune', hint: 'm_nomad_s2_h', success: 'm_nomad_s2_s' },
            { cmd: 'radio', hint: 'm_nomad_s3_h', success: 'm_nomad_s3_s' },
            { cmd: 'ping', hint: 'm_nomad_s4_h', success: 'm_nomad_s4_s' }
        ]
    }
};

class SystemCore {
    constructor() {
        this.theme = null;
        this.lang = 'en';
        this.errorCount = 0;
        this.cmdHistory = { netrunner: [], corp: [], nomad: [] };
        this.histIndex = -1;

        // MISSION STATE
        this.missionStage = 0;
        this.activeMission = null;
        this.alarmActive = false;

        this.resources = {
            en: {
                desc_net: "Circular Interface. Holographic Data. Trance Audio.",
                desc_corp: "Tactical Interface. Heavy Industrial Audio.",
                desc_nomad: "Analog Interface. Retro-Synth Audio.",
                lbl_mission: "CURRENT OBJECTIVE",
                lbl_loc: "LOCATION",
                lbl_upload: "UPLOAD STREAM",
                m_net: "Construct mapping sequence initialized. Find the Ghost.",
                m_corp: "Eliminate target at Sector 4. No witnesses.",
                m_nomad: "Smuggle the package across the border. Avoid patrols.",
                err_unknown: "COMMAND UNKNOWN",
                tip_help: "SYSTEM: TYPE 'HELP' FOR MANUAL.",
                man_net: "<h3>NETRUNNER PROTOCOLS</h3><p>Use the console to execute daemons.<br>- SCAN: Analyze node security.<br>- BREACH: Bypass ICE.<br>- UPLOAD: Exfiltrate data.</p>",
                man_corp: "<h3>ARASAKA OPERATIVE MANUAL</h3><p>Authorized personnel only.<br>- TACTICAL SCAN: Reveal enemy positions.<br>- DEPLOY: Launch drone support.<br>- PURGE: Wipe local logs.</p>",
                man_nomad: "<h3>SCAVENGER TERMINAL</h3><p>Old but gold.<br>- BOOT: Restart engine diagnostics.<br>- RADIO: Tune into local frequencies.<br>- PING: Check mesh latency.</p>",

                // MISSION STEPS EN
                m_net_s1_h: "STEP 1: SCAN NETWORK NODES", m_net_s1_s: "TARGET FOUND: ARASAKA SUBNET [192.168.0.X]",
                m_net_s2_h: "STEP 2: EXECUTE BREACH PROTOCOL", m_net_s2_s: "ICE BYPASSED. ROOT ACCESS GRANTED.",
                m_net_s3_h: "STEP 3: TRACE DATA PACKET", m_net_s3_s: "PACKET ROUTED. UPLINK STABLE.",
                m_net_s4_h: "STEP 4: UPLOAD DAEMON", m_net_s4_s: "PAYLOAD DELIVERED. DISCONNECTING...",

                m_corp_s1_h: "STEP 1: TACTICAL SCAN SECTOR", m_corp_s1_s: "HOSTILES DETECTED. SECTOR 4.",
                m_corp_s2_h: "STEP 2: OVERRIDE SECURITY", m_corp_s2_s: "LETHAL FORCE AUTHORIZED.",
                m_corp_s3_h: "STEP 3: DEPLOY DRONE UNIT", m_corp_s3_s: "UNIT 77-B DEPLOYED. TARGET ACQUIRED.",
                m_corp_s4_h: "STEP 4: PURGE TARGETS", m_corp_s4_s: "TARGETS ELIMINATED. LOGS ERASED.",

                m_nomad_s1_h: "STEP 1: BOOT ENGINE", m_nomad_s1_s: "ENGINE ONLINE. RPM STABLE.",
                m_nomad_s2_h: "STEP 2: TUNE SIGNAL FREQUENCY", m_nomad_s2_s: "SIGNAL LOCKED. CHANNEL CLEAR.",
                m_nomad_s3_h: "STEP 3: LISTEN TO BROADCAST", m_nomad_s3_s: "INTEL RECEIVED. ROUTE UPDATED.",
                m_nomad_s4_h: "STEP 4: PING SMUGGLER MESH", m_nomad_s4_s: "ROUTE CLEAR. STARTING RUN."
            },
            es: {
                desc_net: "Interfaz Circular. Datos Holográficos. Audio Trance.",
                desc_corp: "Interfaz Táctica. Audio Industrial Pesado.",
                desc_nomad: "Interfaz Analógica. Audio Retro-Synth.",
                lbl_mission: "OBJETIVO ACTUAL",
                lbl_loc: "UBICACIÓN",
                lbl_upload: "FLUJO DE SUBIDA",
                m_net: "Secuencia de mapeo iniciada. Encuentra al Fantasma.",
                m_corp: "Eliminar objetivo en Sector 4. Sin testigos.",
                m_nomad: "Contrabandear el paquete por la frontera. Evita patrullas.",
                err_unknown: "COMANDO DESCONOCIDO",
                tip_help: "SISTEMA: ESCRIBE 'AYUDA' PARA MANUAL.",
                man_net: "<h3>PROTOCOLOS NETRUNNER</h3><p>Usa la consola para ejecutar demonios.<br>- SCAN: Analizar seguridad.<br>- BREACH: Romper ICE.<br>- TRACE: Rutear paquetes (Laberinto).<br>- UPLOAD: Exfiltrar datos.</p>",
                man_corp: "<h3>MANUAL OPERATIVO ARASAKA</h3><p>Solo personal autorizado.<br>- TACTICAL SCAN: Revelar enemigos.<br>- OVERRIDE: Autorizar fuerza letal (QTE).<br>- DEPLOY: Lanzar drones.<br>- PURGE: Borrar registros.</p>",
                man_nomad: "<h3>TERMINAL CHATARRERO</h3><p>Viejo pero confiable.<br>- BOOT: Reiniciar diagnósticos.<br>- TUNE: Sintonizar señal (Ondas).<br>- RADIO: Escuchar transmisión.<br>- PING: Comprobar latencia.</p>",

                // MISSION STEPS ES
                m_net_s1_h: "PASO 1: ESCANEAR NODOS DE RED", m_net_s1_s: "OBJETIVO ENCONTRADO: SUBNET ARASAKA",
                m_net_s2_h: "PASO 2: EJECUTAR PROTOCOLO DE BRECHA", m_net_s2_s: "ICE EVADIDO. ACCESO ROOT CONCEDIDO.",
                m_net_s3_h: "PASO 3: TRAZAR PAQUETE DE DATOS", m_net_s3_s: "PAQUETE ENRUTADO. ENLACE ESTABLE.",
                m_net_s4_h: "PASO 4: SUBIR DAEMON", m_net_s4_s: "CARGA ENTREGADA. DESCONECTANDO...",

                m_corp_s1_h: "PASO 1: ESCANEO TÁCTICO DE SECTOR", m_corp_s1_s: "HOSTILES DETECTADOS. SECTOR 4.",
                m_corp_s2_h: "PASO 2: ANULAR SEGURIDAD", m_corp_s2_s: "FUERZA LETAL AUTORIZADA.",
                m_corp_s3_h: "PASO 3: DESPLEGAR UNIDAD DRON", m_corp_s3_s: "UNIDAD 77-B DESPLEGADA. BLANCO ADQUIRIDO.",
                m_corp_s4_h: "PASO 4: PURGAR OBJETIVOS", m_corp_s4_s: "OBJETIVOS ELIMINADOS. REGISTROS BORRADOS.",

                m_nomad_s1_h: "PASO 1: ARRANCAR MOTOR", m_nomad_s1_s: "MOTOR ONLINE. RPM ESTABLES.",
                m_nomad_s2_h: "PASO 2: SINTONIZAR FRECUENCIA", m_nomad_s2_s: "SEÑAL BLOQUEADA. CANAL LIMPIO.",
                m_nomad_s3_h: "PASO 3: ESCUCHAR TRANSMISIÓN", m_nomad_s3_s: "INTEL RECIBIDA. RUTA ACTUALIZADA.",
                m_nomad_s4_h: "PASO 4: PINGEAR RED DE CONTRABANDO", m_nomad_s4_s: "RUTA DESPEJADA. INICIANDO CARRERA."
            },
            pt: {
                desc_net: "Interface Circular. Dados Holográficos. Áudio Trance.",
                desc_corp: "Interface Tática. Áudio Industrial Pesado.",
                desc_nomad: "Interface Analógica. Áudio Retro-Synth.",
                lbl_mission: "OBJETIVO ATUAL",
                lbl_loc: "LOCALIZAÇÃO",
                lbl_upload: "FLUXO DE UPLOAD",
                m_net: "Sequência de mapeamento iniciada. Encontre o Fantasma.",
                m_corp: "Eliminar alvo no Setor 4. Sem testemunhas.",
                m_nomad: "Contrabandear o pacote pela fronteira. Evite patrulhas.",
                err_unknown: "COMANDO DESCONHECIDO",
                tip_help: "SISTEMA: DIGITE 'AJUDA' PARA MANUAL.",
                man_net: "<h3>PROTOCOLOS NETRUNNER</h3><p>Use o console para executar daemons.<br>- SCAN: Analisar segurança.<br>- BREACH: Quebrar ICE.<br>- TRACE: Roteamento de pacotes (Labirinto).<br>- UPLOAD: Exfiltrar dados.</p>",
                man_corp: "<h3>MANUAL OPERATIVO ARASAKA</h3><p>Apenas pessoal autorizado.<br>- TACTICAL SCAN: Revelar inimigos.<br>- OVERRIDE: Autorizar força letal (QTE).<br>- DEPLOY: Lançar drones.<br>- PURGE: Apagar registros.</p>",
                man_nomad: "<h3>TERMINAL SUCATEIRO</h3><p>Velho mas confiável.<br>- BOOT: Reiniciar diagnósticos.<br>- TUNE: Sintonizar sinal (Ondas).<br>- RADIO: Ouvir transmissão.<br>- PING: Verificar latência.</p>",

                // MISSION STEPS PT
                m_net_s1_h: "PASSO 1: ESCANEAR NÓDULOS DE REDE", m_net_s1_s: "ALVO ENCONTRADO: SUBNET ARASAKA",
                m_net_s2_h: "PASSO 2: EXECUTAR PROTOCOLO DE QUEBRA", m_net_s2_s: "ICE IGNORADO. ACESSO ROOT CONCEDIDO.",
                m_net_s3_h: "PASSO 3: RASTREAR PACOTE DE DADOS", m_net_s3_s: "PACOTE ROTEADO. LINK ESTÁVEL.",
                m_net_s4_h: "PASSO 4: FAZER UPLOAD DO DAEMON", m_net_s4_s: "CARGA ENTREGUE. DESCONECTANDO...",

                m_corp_s1_h: "PASSO 1: SCAN TÁTICO DE SETOR", m_corp_s1_s: "INIMIGOS DETECTADOS. SETOR 4.",
                m_corp_s2_h: "PASSO 2: ANULAR SEGURANÇA", m_corp_s2_s: "FORÇA LETAL AUTORIZADA.",
                m_corp_s3_h: "PASSO 3: IMPLANTAR DRONE", m_corp_s3_s: "UNIDADE 77-B IMPLANTADA. ALVO ADQUIRIDO.",
                m_corp_s4_h: "PASSO 4: EXPURGAR ALVOS", m_corp_s4_s: "ALVOS ELIMINADOS. REGISTROS APAGADOS.",

                m_nomad_s1_h: "PASO 1: LIGAR MOTOR", m_nomad_s1_s: "MOTOR ONLINE. RPM ESTÁVEL.",
                m_nomad_s2_h: "PASSO 2: SINTONIZAR FREQUÊNCIA", m_nomad_s2_s: "SINAL BLOQUEADO. CANAL LIMPO.",
                m_nomad_s3_h: "PASSO 3: OUVIR TRANSMISSÃO", m_nomad_s3_s: "INTEL RECEBIDA. ROTA ATUALIZADA.",
                m_nomad_s4_h: "PASSO 4: PINGAR REDE DE CONTRABANDO", m_nomad_s4_s: "ROTA LIMPA. INICIANDO CORRIDA."
            }
        };
    }

    init() {
        // DEPENDENCY CHECK
        if (typeof i18next === 'undefined') {
            console.error("NEO-OS: i18next library failed to load.");
            alert("CRITICAL ERROR: i18next LIB MISSING.\nCHECK INTERNET CONNECTION.");
            return;
        }

        i18next.init({ lng: 'en', resources: { en: { translation: this.resources.en }, es: { translation: this.resources.es }, pt: { translation: this.resources.pt } } },
            () => this.updateText());

        // Init Minigame
        this.minigame = new BreachMinigame(this);

        // Security & Progression (Phase 6)
        this.securityLevel = 1;
        this.puzzleActive = false;

        // Anti-Cheat: Disable Context Menu
        document.addEventListener('contextmenu', event => event.preventDefault());

        // ... rest of init
        this.initViz();

        if (typeof THREE === 'undefined') {
            console.error("NEO-OS: THREE.js not loaded. Check internet connection or script path.");
            alert("SYSTEM ERROR: THREE.JS LIB MISSING.\nCHECK INTERNET CONNECTION.");
            // Continue without 3D
        } else {
            try {
                this.init3DEngine(); // Enabled 3D Background
            } catch (e) {
                console.error("3D Init Failed:", e);
                // alert("3D ENGINE FAILED: " + e.message); // Optional, maybe too intrusive
            }
        }

        // Routing Check
        const params = new URLSearchParams(window.location.search);
        const themeParam = params.get('theme');
        if (themeParam) {
            // Skip start screen
            document.getElementById('start-screen').classList.add('hidden');
            this.loadTheme(themeParam);
        } else {
            // Init Audio on first user Interaction (Browser policy)
            const startAudio = () => {
                if (this.theme) return;

                // Force Resume Check
                if (audio.ctx.state === 'suspended') {
                    audio.ctx.resume().then(() => {
                        console.log("NEO-OS: Audio Context Resumed");
                        audio.playStartAmbient(); // Music
                    }).catch(err => console.error("Audio Resume Error:", err));
                } else {
                    console.log("NEO-OS: Audio already running");
                    audio.playStartAmbient();
                }

                window.removeEventListener('click', startAudio);
                window.removeEventListener('keydown', startAudio);
            };
            window.addEventListener('click', startAudio);
            window.addEventListener('keydown', startAudio);
        }

        // Slider
        document.getElementById('vol-slider').addEventListener('input', (e) => audio.setVolume(e.target.value / 100));

        // Theme Inputs & History
        ['net', 'corp', 'nomad'].forEach(t => {
            const el = document.getElementById('in-' + t);
            if (el) {
                // Submit
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.handleCmd(t, el.value);
                        el.value = '';
                        this.histIndex = -1; // Reset index
                    }
                    // History Nav
                    else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const h = this.cmdHistory[t === 'net' ? 'netrunner' : t];
                        if (h.length > 0) {
                            if (this.histIndex < h.length - 1) this.histIndex++;
                            el.value = h[h.length - 1 - this.histIndex];
                        }
                    }
                    else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const h = this.cmdHistory[t === 'net' ? 'netrunner' : t];
                        if (this.histIndex > 0) {
                            this.histIndex--;
                            el.value = h[h.length - 1 - this.histIndex];
                        } else if (this.histIndex === 0) {
                            this.histIndex = -1;
                            el.value = '';
                        }
                    }
                    else {
                        audio.playTyping(this.theme);
                    }
                });
            }
        });

        setInterval(() => {
            if (document.getElementById('nomad-clock')) document.getElementById('nomad-clock').innerText = new Date().toLocaleTimeString();
        }, 1000);
    }

    setLang(l) {
        this.lang = l;
        i18next.changeLanguage(l, () => this.updateText());
    }

    updateText() {
        document.querySelectorAll('[data-i18n]').forEach(e => e.innerText = i18next.t(e.dataset.i18n));
        // Update missions if theme active
        if (this.theme) {
            const mKey = this.theme === 'netrunner' ? 'm_net' : this.theme === 'corp' ? 'm_corp' : 'm_nomad';
            const elId = this.theme === 'netrunner' ? 'net-mission-text' : this.theme === 'corp' ? 'corp-mission-text' : 'nomad-mission-text';
            const el = document.getElementById(elId);
            if (el) el.innerText = i18next.t(mKey);
        }
    }

    loadTheme(t) {
        this.theme = t;

        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('theme', t);
        window.history.pushState({}, '', url);

        document.getElementById('start-screen').classList.add('fade-out'); // Animate out
        setTimeout(() => document.getElementById('start-screen').classList.add('hidden'), 500);

        // Hide all
        document.getElementById('ui-netrunner').classList.add('hidden');
        document.getElementById('ui-corp').classList.add('hidden');
        document.getElementById('ui-nomad').classList.add('hidden');

        // Show One
        const ui = document.getElementById('ui-' + t);
        if (ui) {
            ui.classList.remove('hidden');
            ui.classList.add('fade-in');
        }

        // Colors
        const r = document.documentElement.style;
        if (t === 'netrunner') { r.setProperty('--theme-color', '#00ffcc'); r.setProperty('--theme-bg', '#000810'); }
        else if (t === 'corp') { r.setProperty('--theme-color', '#ff3333'); r.setProperty('--theme-bg', '#1a0505'); }
        else { r.setProperty('--theme-color', '#ffb833'); r.setProperty('--theme-bg', '#1a1000'); }

        // Mission Text Update
        this.updateText();

        // Audio
        audio.startThemeMusic(t);
        this.switchScene(t); // Update 3D Scene

        // START MISSION
        this.missionStage = 0;
        this.activeMission = MISSIONS[t];
        this.alarmActive = false;
        document.getElementById('alarm-overlay').classList.remove('alarm-active');
        this.updateMissionUI();

        // Show Manual on Entry (User Requirement)
        setTimeout(() => this.showManual(), 1000);
    }

    reset() {
        // Clear param
        const url = new URL(window.location);
        url.searchParams.delete('theme');
        window.history.pushState({}, '', url);
        location.reload();
    }

    handleCmd(theme, cmd) {
        if (!cmd) return;
        const c = cmd.trim().toLowerCase();
        const tKey = theme === 'net' ? 'netrunner' : theme;

        // Add to History
        this.cmdHistory[tKey].push(cmd);
        if (this.cmdHistory[tKey].length > 20) this.cmdHistory[tKey].shift();

        // Helpers
        const resp = (msg) => this.log(tKey, msg);

        // HELP CHECK
        if (['help', 'ayuda', 'ajuda', '?', 'man'].includes(c)) {
            this.showManual();
            resp("MANUAL OPENED.");
            this.errorCount = 0;
            return;
        }

        // MISSION LOGIC
        if (this.activeMission && !this.alarmActive) {
            const currentStep = this.activeMission.steps[this.missionStage];

            // Check if Command Matches Current Step
            if (currentStep && c === currentStep.cmd) {

                // MINIGAME INTERCEPTION (For Breach Command)
                if (c === 'breach' && this.minigame) {
                    this.minigame.start();
                    return; // Wait for minigame result
                }

                // VISUAL TRIGGER: WARP SPEED (Netrunner)
                if (theme === 'netrunner' && c === 'upload') {
                    this.warpSpeed = true;
                    setTimeout(() => { this.warpSpeed = false; }, 3000);
                }

                // VISUAL TRIGGER: DRONE SCAN (Arasaka)
                if (theme === 'corp' && c === 'deploy') {
                    if (this.droneGroup) {
                        this.droneGroup.visible = true;
                        setTimeout(() => { if (this.droneGroup) this.droneGroup.visible = false; }, 5000);
                    }
                }

                // SUCCESS
                resp(i18next.t(currentStep.success));
                audio.playTyping(theme); // Success sound
                this.missionStage++;
                this.updateMissionUI();

                // Mission Complete?
                if (this.missionStage >= this.activeMission.steps.length) {
                    resp("MISSION COMPLETE. STANDBY FOR NEXT JOB.");
                    // Reset or endless mode logic could go here
                }
                return;
            }

            // Check if Command is Out of Sequence (Logic Check)
            // If user types a future command or a wrong mission command
            const isMissionCmd = this.activeMission.steps.some(s => s.cmd === c);
            if (isMissionCmd && (!currentStep || c !== currentStep.cmd)) {
                // ALARM TRIGGER
                this.triggerAlarm(tKey);
                resp("ERROR: SEQUENCE VIOLATION. ALARM TRIGGERED.");
                return;
            }
        }

        // FALLBACK: Allow Basic Commands or Flavor Text if not in mission strict mode
        // For now, we handle specific flavor text if NOT causing an alarm

        // PUZZLE TRIGGERS (Phase 5)
        if (tKey === 'netrunner' && c === 'trace') {
            this.startDataMaze();
            return;
        }
        if (tKey === 'corp' && c === 'override') {
            this.startArasakaQTE();
            return;
        }
        if (tKey === 'nomad' && c === 'tune') {
            this.startNomadTuner();
            return;
        }

        switch (tKey) {
            case 'netrunner':
                if (c === 'clear') this.log(tKey, 'CLEAR', true); // handled by input
                else this.handleError(tKey, c);
                break;
            case 'corp':
                this.handleError(tKey, c);
                break;
            case 'nomad':
                this.handleError(tKey, c);
                break;
            default:
                this.handleError(tKey, c);
        }
    }

    triggerAlarm(theme) {
        this.alarmActive = true;
        const overlay = document.getElementById('alarm-overlay');
        overlay.classList.remove('hidden');
        overlay.classList.add('alarm-active');

        // Play Alarm Sound
        audio.playTone(800, 'sawtooth', 0.1, 0.5);
        setTimeout(() => audio.playTone(600, 'sawtooth', 0.1, 0.5), 500);

        // Reset Alarm after 3s
        setTimeout(() => {
            overlay.classList.remove('alarm-active');
            overlay.classList.add('hidden');
            this.alarmActive = false;
        }, 3000);
    }

    completeBreach() {
        // Callback from Minigame Victory
        const currentStep = this.activeMission.steps[this.missionStage];
        this.log('netrunner', i18next.t(currentStep.success));
        audio.playTyping('netrunner');

        this.missionStage++;
        this.updateMissionUI();

        // Check if this was the last step (unlikely for breach, but safe to check)
        if (this.missionStage >= this.activeMission.steps.length) {
            this.log('netrunner', "MISSION COMPLETE.");
        }
    }

    updateMissionUI() {
        if (!this.activeMission) return;

        const step = this.activeMission.steps[this.missionStage];
        const hintText = step ? i18next.t(step.hint) : "MISSION COMPLETE";

        // Update Netrunner
        if (this.theme === 'netrunner') {
            const container = document.getElementById('ui-netrunner');
            let hintEl = document.getElementById('net-mission-hint');
            if (!hintEl) {
                hintEl = document.createElement('div');
                hintEl.id = 'net-mission-hint';
                hintEl.className = 'mission-hint';
                hintEl.style.color = '#00ffcc';
                container.appendChild(hintEl);
            }
            hintEl.innerText = hintText;
        }

        // Update Corp
        if (this.theme === 'corp') {
            const el = document.getElementById('corp-mission-text');
            if (el) el.innerText = hintText;
        }

        // Update Nomad
        if (this.theme === 'nomad') {
            const el = document.getElementById('nomad-mission-text');
            if (el) el.innerText = hintText;
        }
    }

    handleError(theme, cmd) {
        this.log(theme, `${i18next.t('err_unknown')} (${cmd})`, true);
        this.errorCount++;
        audio.playTone(100, 'sawtooth', 0.1, 0.2); // Error Buzz
        if (this.errorCount >= 3) {
            this.log(theme, i18next.t('tip_help'), true);
            this.errorCount = 0;
        }
    }

    log(theme, msg, isError = false) {
        const style = isError ? 'color:#ff3333;' : 'color:#00ffcc;';

        if (theme === 'nomad') {
            const log = document.getElementById('log-nomad');
            log.innerHTML += `<div class="nomad-line" style="${isError ? 'color:red' : ''}">> ${msg}</div>`;
            log.scrollTop = log.scrollHeight;
        } else if (theme === 'corp') {
            const log = document.getElementById('log-corp');
            log.innerHTML += `<div style="${isError ? 'color:red' : ''}">> ${msg}</div>`;
            log.scrollTop = log.scrollHeight;
        } else if (theme === 'netrunner') {
            // Updated Visual Log for Netrunner
            const log = document.getElementById('log-net');
            if (log) {
                log.innerHTML += `<div style="${style} margin-bottom:2px;">> ${msg}</div>`;
                log.scrollTop = log.scrollHeight;
            }
            // Keep placeholder effect
            const fin = document.querySelector('.net-input');
            if (fin) {
                fin.placeholder = msg.substring(0, 30) + "...";
                setTimeout(() => fin.placeholder = "EXECUTE PROTOCOL", 3000);
            }
        }
    }

    showManual() {
        const ov = document.getElementById('manual-overlay');
        const box = document.getElementById('manual-box');
        if (!ov || !box) return;

        // Remove old classes
        box.classList.remove('mn-net', 'mn-corp', 'mn-nomad');

        // Add specific class
        if (this.theme === 'netrunner') box.classList.add('mn-net');
        else if (this.theme === 'corp') box.classList.add('mn-corp');
        else box.classList.add('mn-nomad');

        this.updateManualContent();
        ov.classList.remove('hidden');
    }

    closeManual() {
        document.getElementById('manual-overlay').classList.add('hidden');
    }

    updateManualContent() {
        // Just title for now, content depends on theme
        const t = this.theme;
        let html = '';
        if (t === 'netrunner') html = i18next.t('man_net');
        else if (t === 'corp') html = i18next.t('man_corp');
        else html = i18next.t('man_nomad');

        document.getElementById('man-content').innerHTML = html;
    }

    // Visualizer
    initViz() {
        const c = document.getElementById('viz-root');
        for (let i = 0; i < 8; i++) {
            const d = document.createElement('div'); d.className = 'viz-bar'; c.appendChild(d);
        }
    }

    // 3D Background - Procedural City
    // 3D ENGINE & SCENE MANAGER
    init3DEngine() {
        const cvs = document.getElementById('cyber-canvas');
        if (!cvs) return;

        // Setup Renderer & Camera ONCE
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a14);
        this.scene.fog = new THREE.Fog(0x0a0a14, 20, 100);

        this.cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.ren = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: false }); // Force Opaque
        this.ren.setSize(window.innerWidth, window.innerHeight);
        this.ren.setPixelRatio(window.devicePixelRatio);
        console.log("NEO-OS: 3D Engine Initialized");

        // Resize Listener
        window.addEventListener('resize', () => {
            this.cam.aspect = window.innerWidth / window.innerHeight;
            this.cam.updateProjectionMatrix();
            this.ren.setSize(window.innerWidth, window.innerHeight);
        });

        // Start Loop
        this.activeAnim = null; // Function to run per frame
        const loop = () => {
            requestAnimationFrame(loop);
            try {
                if (this.activeAnim) this.activeAnim();
                this.ren.render(this.scene, this.cam);

                // DEBUG ONCE
                if (!window.hasLoggedRender) {
                    console.log("NEO-OS: First Render Frame. Scene children:", this.scene.children.length);
                    window.hasLoggedRender = true;
                }
            } catch (e) {
                console.error("3D Loop Error:", e);
            }

            // Viz Sync
            if (audio && audio.analyser) {
                const data = new Uint8Array(audio.analyser.frequencyBinCount);
                audio.analyser.getByteFrequencyData(data);
                const bars = document.querySelectorAll('.viz-bar');
                bars.forEach((b, i) => {
                    const h = Math.max(4, (data[i * 2] / 255) * 40);
                    b.style.height = h + 'px';
                });
            }
            if (window.TWEEN) window.TWEEN.update();
        };
        loop();

        // Load Default
        console.log("NEO-OS: Loading initial scene 'city'...");
        this.switchScene('city');
    }

    switchScene(key) {
        // Clear old scene
        while (this.scene.children.length > 0) {
            const obj = this.scene.children[0];
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
            this.scene.remove(obj);
        }

        // Reset Camera
        this.cam.position.set(0, 0, 0);
        this.cam.rotation.set(0, 0, 0);

        // Build New
        if (key === 'netrunner') this.buildNetrunner();
        else if (key === 'corp') this.buildArasaka();
        else if (key === 'nomad') this.buildNomad();
        else this.buildCity();
    }

    createGlitchTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128; // Low res for performance stuff
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 128, 128);

        // Skull / Virus Shape
        ctx.fillStyle = '#ff0000';
        ctx.font = '80px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☠️', 64, 64); // Using Emoji is a clever hack for complex shapes!

        // Glitch lines
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        for (let i = 0; i < 10; i++) {
            const y = Math.random() * 128;
            ctx.fillRect(0, y, 128, 2);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.magFilter = THREE.NearestFilter; // Pixelated look
        return tex;
    }

    buildCity() {
        this.scene.background = new THREE.Color(0x0a0a14);

        // Pre-generate glitch texture
        if (!this.glitchTexture) this.glitchTexture = this.createGlitchTexture();
        this.scene.fog = new THREE.Fog(0x0a0a14, 20, 100);
        this.cam.position.set(0, 10, 30);
        this.cam.lookAt(0, 5, 0);

        // Lighting
        this.scene.add(new THREE.AmbientLight(0x111122, 0.8));
        const dir = new THREE.DirectionalLight(0x00ccff, 0.6);
        // Glowing Floor
        const floorGeo = new THREE.PlaneGeometry(200, 200);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            emissive: 0xffffff,
            emissiveIntensity: 0.15,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            metalness: 0.8
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.1; // Just below buildings
        this.scene.add(floor);

        // Reflection Grid (Optional detail)
        const grid = new THREE.GridHelper(200, 50, 0xffffff, 0x333333);
        grid.position.y = 0;
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        this.scene.add(grid);

        // Buildings
        // Buildings (Neon Greens & Blues)
        const mats = [
            new THREE.MeshStandardMaterial({ color: 0x00ff66, emissive: 0x00ff33, emissiveIntensity: 0.8 }), // Neon Green
            new THREE.MeshStandardMaterial({ color: 0x00ccff, emissive: 0x0066ff, emissiveIntensity: 0.9 }), // Cyan Blue
            new THREE.MeshStandardMaterial({ color: 0x0099ff, emissive: 0x0033ff, emissiveIntensity: 0.8 }), // Deep Blue
        ];
        const geo = new THREE.BoxGeometry(1, 1, 1); // Reused base

        // Store buildings for later access if needed, or just add decals here?
        // Let's add them to a list to easy access for decals
        this.buildings = [];

        for (let i = -8; i <= 8; i++) {
            for (let j = -8; j <= 8; j++) {
                if (Math.random() > 0.4) continue;
                const h = 5 + Math.random() * 20;
                const b = new THREE.Mesh(geo, mats[Math.floor(Math.random() * mats.length)]);
                b.position.set(i * 7, h / 2, j * 7);
                b.scale.set(3 + Math.random() * 2, h, 3 + Math.random() * 2);
                this.scene.add(b);
                this.buildings.push(b);
            }
        }

        // NEURAL NETWORK OVERLAY
        const nodeCount = 60;
        const nodeGeo = new THREE.BufferGeometry();
        const nodePos = [];
        const linesMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.15 });

        // Create nodes in a dome shape above city
        for (let i = 0; i < nodeCount; i++) {
            const x = (Math.random() - 0.5) * 60;
            const y = 15 + Math.random() * 20; // High in sky
            const z = (Math.random() - 0.5) * 60;
            nodePos.push(x, y, z);
        }
        nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePos, 3));
        const nodeMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.8 });
        const nodes = new THREE.Points(nodeGeo, nodeMat);
        this.scene.add(nodes);

        // Connections
        const linesGeo = new THREE.BufferGeometry();
        const updateConnections = () => {
            const positions = nodes.geometry.attributes.position.array;
            const linePos = [];
            for (let i = 0; i < nodeCount; i++) {
                for (let j = i + 1; j < nodeCount; j++) {
                    const dx = positions[i * 3] - positions[j * 3];
                    const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                    const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (dist < 15) { // Connection threshold
                        linePos.push(
                            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                        );
                    }
                }
            }
            linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
        };
        const lines = new THREE.LineSegments(linesGeo, linesMat);
        this.scene.add(lines);

        // VIRUS PARTICLES (Floating Cloud)
        const texLoader = new THREE.TextureLoader();

        const loadTexture = (path) => {
            return texLoader.load(path, undefined, undefined, (e) => {
                console.warn("Texture load failed (File protocol restriction?):", path);
            });
        };

        const virusTex = loadTexture('assets/img/virus_particle.svg');
        virusTex.magFilter = THREE.NearestFilter;

        // SKULL TEXTURE (For Pillars)
        const skullTex = loadTexture('assets/img/skull_virus.svg');
        skullTex.magFilter = THREE.NearestFilter;

        const holoCount = 50;
        const holoGeo = new THREE.BufferGeometry();
        const holoPos = [];
        for (let i = 0; i < holoCount; i++) {
            holoPos.push((Math.random() - 0.5) * 50, 5 + Math.random() * 20, (Math.random() - 0.5) * 50);
        }
        holoGeo.setAttribute('position', new THREE.Float32BufferAttribute(holoPos, 3));
        const topholoMat = new THREE.PointsMaterial({
            size: 2,
            map: virusTex,
            transparent: true,
            opacity: 0,
            color: 0xff0000
        });
        const holograms = new THREE.Points(holoGeo, topholoMat);
        this.scene.add(holograms);

        // DIGITAL RAIN (Falling Squares)
        const rainCount = 1000;
        const rainGeo = new THREE.BufferGeometry();
        const rainPos = [];
        for (let i = 0; i < rainCount; i++) {
            rainPos.push(
                (Math.random() - 0.5) * 100, // Wide spread X
                Math.random() * 40,        // Height 0-40
                (Math.random() - 0.5) * 100  // Wide spread Z
            );
        }
        rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(rainPos, 3));
        const rainMat = new THREE.PointsMaterial({
            color: 0x00ffcc,
            size: 0.3,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });
        const rainSystem = new THREE.Points(rainGeo, rainMat);
        this.scene.add(rainSystem);

        // SKULL DECALS (Attached to Pillars)
        const skullDecals = [];
        const decalGeo = new THREE.PlaneGeometry(1, 1);
        const decalMat = new THREE.MeshBasicMaterial({
            map: skullTex,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });

        // Attach a decal to each building
        if (this.buildings) {
            this.buildings.forEach(b => {
                const decal = new THREE.Mesh(decalGeo, decalMat.clone());

                // Position on the "Front" face (Relative to Z)
                decal.position.copy(b.position);
                decal.position.z += b.scale.z / 2 + 0.1; // Slightly offset from wall

                // Randomly offset XY
                decal.position.x += (Math.random() - 0.5) * b.scale.x * 0.6;
                decal.position.y += (Math.random() - 0.5) * b.scale.y * 0.6;

                // Scale decal
                const scale = Math.min(b.scale.x, b.scale.y) * 0.8;
                decal.scale.set(scale, scale, 1);

                // Save original position & scale for Shake & Pulse effect
                decal.userData.originalPos = decal.position.clone();
                decal.userData.originalScale = scale;

                this.scene.add(decal);
                skullDecals.push(decal);
            });
        }

        // OLD SPRITE LOGIC REMOVED
        let time = 0;
        this.glitchActive = false;

        this.activeAnim = () => {
            time += 0.002;
            this.cam.position.x = Math.sin(time) * 40;
            this.cam.position.z = Math.cos(time) * 40 + 20;
            this.cam.position.y = 15 + Math.sin(time * 0.7) * 5;
            this.cam.lookAt(0, 8, 0);

            // Animate Nodes
            nodes.rotation.y -= 0.001;
            lines.rotation.y -= 0.001;

            // Animate Holograms (Float)
            holograms.rotation.y += 0.01;
            const hPos = holograms.geometry.attributes.position.array;
            for (let i = 1; i < hPos.length; i += 3) {
                hPos[i] += Math.sin(time * 5 + i) * 0.05;
            }
            holograms.geometry.attributes.position.needsUpdate = true;

            // Animate Rain
            const rPos = rainSystem.geometry.attributes.position.array;
            for (let i = 1; i < rPos.length; i += 3) {
                rPos[i] -= 0.1 + Math.random() * 0.1; // Fall down
                if (rPos[i] < 0) {
                    rPos[i] = 40; // Reset to top
                }
            }
            rainSystem.geometry.attributes.position.needsUpdate = true;

            // Animate Skulls (Glitch Shake & Flicker)
            if (this.glitchActive) {
                skullDecals.forEach((s) => {
                    if (s.userData.originalPos) {
                        // Position Shake (XY only, keep attached to wall)
                        s.position.x = s.userData.originalPos.x + (Math.random() - 0.5) * 0.2;
                        s.position.y = s.userData.originalPos.y + (Math.random() - 0.5) * 0.2;

                        // Opacity Flicker
                        s.material.opacity = 0.5 + Math.random() * 0.5;

                        // Scale Pulse
                        const scale = s.userData.originalScale * (0.9 + Math.random() * 0.2);
                        s.scale.set(scale, scale, 1);
                    }
                });
            } else {
                // Ensure reset if animation stops abruptly
                skullDecals.forEach(s => {
                    if (s.userData.originalPos) s.position.copy(s.userData.originalPos);
                });
            }

            // Subtle pulse
            const positions = nodes.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += Math.sin(time * 2 + i) * 0.02;
            }
            nodes.geometry.attributes.position.needsUpdate = true;
            updateConnections();

            // RANDOM GLITCH EFFECT ("The Bug")
            if (!this.glitchActive && Math.random() < 0.002) { // 0.2% chance per frame
                this.glitchActive = true;

                // SHOW HOLOGRAMS & DECALS
                topholoMat.opacity = 0.8;
                skullDecals.forEach(d => d.material.opacity = 1);

                // RAIN GOES RED
                rainMat.color.setHex(0xff0000);

                // Set RED (Pillars Only)
                mats.forEach(m => {
                    m.color.setHex(0xff0000);
                    m.emissive.setHex(0xff0000);
                    m.emissiveIntensity = 2; // Super bright
                    m.needsUpdate = true;
                });

                // Audio Glitch Texture
                if (audio && audio.playTone) audio.playTone(50 + Math.random() * 100, 'sawtooth', 0.1, 0.1);

                // Revert after 1-2s
                setTimeout(() => {
                    // Restore Original Colors
                    const originals = [
                        { c: 0x00ff66, e: 0x00ff33 },
                        { c: 0x00ccff, e: 0x0066ff },
                        { c: 0x0099ff, e: 0x0033ff }
                    ];

                    mats.forEach((m, i) => {
                        // Use modulo to cycle logic if random assignment was used, 
                        // but here we just assign roughly back to palette
                        const og = originals[i % originals.length];
                        m.color.setHex(og.c);
                        m.emissive.setHex(og.e);
                        m.emissiveIntensity = 0.8;

                        m.needsUpdate = true;
                    });

                    // HIDE HOLOGRAMS & DECALS
                    topholoMat.opacity = 0;
                    skullDecals.forEach(d => d.material.opacity = 0);

                    // RAIN RESET
                    rainMat.color.setHex(0x00ffcc);

                    this.glitchActive = false;
                }, 500 + Math.random() * 1500);
            }
        };
    }

    buildNetrunner() {
        this.scene.background = new THREE.Color(0x000505);
        this.scene.fog = new THREE.Fog(0x000505, 5, 50);

        // Data Tunnel (Particles)
        const count = 2000;
        const geo = new THREE.BufferGeometry();
        const pos = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 5 + Math.random() * 10;
            const z = (Math.random() - 0.5) * 100;
            pos.push(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.2, color: 0x00ffcc, transparent: true, opacity: 0.8 });
        const tunnel = new THREE.Points(geo, mat);
        this.scene.add(tunnel);

        this.activeAnim = () => {
            tunnel.rotation.z += 0.002;

            // Warp Speed Logic
            const speed = this.warpSpeed ? 5.0 : 0.5;

            // Move through tunnel
            const arr = tunnel.geometry.attributes.position.array;
            for (let i = 2; i < arr.length; i += 3) {
                arr[i] += speed;
                if (arr[i] > 50) arr[i] = -50;
            }
            tunnel.geometry.attributes.position.needsUpdate = true;

            // FOV Effect (Warp Stretch)
            if (this.warpSpeed) {
                if (this.cam.fov < 100) {
                    this.cam.fov += 2;
                    this.cam.updateProjectionMatrix();
                }
            } else {
                if (this.cam.fov > 75) {
                    this.cam.fov -= 1;
                    this.cam.updateProjectionMatrix();
                }
            }
        };
    }

    buildArasaka() {
        this.scene.background = new THREE.Color(0x050000);
        this.scene.fog = null;

        // Wireframe Globe
        const geo = new THREE.IcosahedronGeometry(10, 2);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, transparent: true, opacity: 0.3 });
        const globe = new THREE.Mesh(geo, mat);
        this.scene.add(globe);

        // Core
        const coreGeo = new THREE.IcosahedronGeometry(2, 0);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        const core = new THREE.Mesh(coreGeo, coreMat);
        this.scene.add(core);

        this.cam.position.z = 25;

        // Drone Group
        const droneGroup = new THREE.Group();
        droneGroup.visible = false;
        this.droneGroup = droneGroup; // Save ref

        // Drone Shape
        const dGeo = new THREE.ConeGeometry(0.5, 2, 4);
        const dMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const drone = new THREE.Mesh(dGeo, dMat);
        drone.rotation.x = Math.PI / 2;
        droneGroup.add(drone);

        // Scanner Light
        const dLight = new THREE.PointLight(0xff0000, 2, 10);
        droneGroup.add(dLight);
        this.scene.add(droneGroup);

        this.activeAnim = () => {
            globe.rotation.y += 0.002;
            globe.rotation.x += 0.001;
            core.rotation.y -= 0.005;

            // Drone Patrol
            if (this.droneGroup.visible) {
                const t = Date.now() * 0.001;
                this.droneGroup.position.x = Math.sin(t) * 12;
                this.droneGroup.position.z = Math.cos(t) * 12;
                this.droneGroup.lookAt(0, 0, 0);
            }
        };
    }

    buildNomad() {
        this.scene.background = new THREE.Color(0x100500);
        this.scene.fog = new THREE.FogExp2(0x100500, 0.02);

        // Synthwave Grid
        const gridGeo = new THREE.PlaneGeometry(100, 100, 40, 40);
        const gridMat = new THREE.MeshBasicMaterial({ color: 0xff5500, wireframe: true, transparent: true, opacity: 0.5 });
        const grid = new THREE.Mesh(gridGeo, gridMat);
        grid.rotation.x = -Math.PI / 2;
        this.scene.add(grid);

        // Sun
        const sunGeo = new THREE.CircleGeometry(20, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xff00cc });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(0, 10, -40);
        this.scene.add(sun);

        // Save reference for Radio Viz
        this.nomadGrid = grid;

        this.activeAnim = () => {
            // Move Grid
            grid.position.z = (Date.now() * 0.01) % 5;

            // RADIO AUDIO VIZ
            if (audio && audio.analyser) {
                const data = audio.getFreqData();
                const verts = grid.geometry.attributes.position.array;
                // Deform Z (which is Y in world space due to rotation)
                for (let i = 0; i < verts.length; i += 3) {
                    const x = verts[i];
                    if (Math.abs(x) < 20) { // Center path
                        const strength = data ? (data[Math.abs(Math.floor(x)) % 10] / 255) : 0;
                        verts[i + 2] = strength * 5;
                    }
                }
                grid.geometry.attributes.position.needsUpdate = true;
            }
        };
    }

    // ============================================
    // KEYBOARD PUZZLES (PHASE 5)
    // ============================================

    // 1. NETRUNNER: DATA MAZE (Arrows)
    startDataMaze() {
        if (this.puzzleActive) return; // Lock
        this.puzzleActive = true;

        const container = document.getElementById('puzzle-net-maze');
        const gridEl = document.getElementById('maze-grid');
        container.classList.remove('hidden');

        // Difficulty Scaling
        const size = 10;
        let player = { x: 1, y: 1 };
        const goal = { x: 8, y: 8 };
        const walls = [];

        // Level 1: ~15 walls, Level 5: ~40 walls
        const baseWalls = 15 + (this.securityLevel * 5);
        const wallCount = baseWalls + Math.floor(Math.random() * 5);

        for (let i = 0; i < wallCount; i++) {
            const wx = Math.floor(Math.random() * size);
            const wy = Math.floor(Math.random() * size);
            if ((wx !== player.x || wy !== player.y) && (wx !== goal.x || wy !== goal.y)) {
                walls.push({ x: wx, y: wy });
            }
        }

        const isWall = (x, y) => walls.some(w => w.x === x && w.y === y);

        const render = () => {
            gridEl.innerHTML = '';
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'maze-cell';
                    if (player.x === x && player.y === y) cell.classList.add('maze-player');
                    else if (goal.x === x && goal.y === y) cell.classList.add('maze-goal');
                    else if (isWall(x, y)) cell.classList.add('maze-wall');
                    gridEl.appendChild(cell);
                }
            }
        };
        render();

        const handler = (e) => {
            if (!this.puzzleActive) return; // Safety check
            let nextX = player.x;
            let nextY = player.y;
            if (e.key === 'ArrowUp') nextY--;
            if (e.key === 'ArrowDown') nextY++;
            if (e.key === 'ArrowLeft') nextX--;
            if (e.key === 'ArrowRight') nextX++;

            // Wall Check
            if (nextX >= 0 && nextX < size && nextY >= 0 && nextY < size && !isWall(nextX, nextY)) {
                player.x = nextX; player.y = nextY;
                render();
                if (player.x === goal.x && player.y === goal.y) {
                    document.removeEventListener('keydown', handler);
                    container.classList.add('hidden');
                    this.log('netrunner', `DATA PACKET DELIVERED. (Lv ${this.securityLevel} -> ${this.securityLevel + 1})`, false);
                    audio.playTyping('netrunner');
                    this.puzzleActive = false;
                    this.securityLevel++;
                }
            }
        };
        document.addEventListener('keydown', handler);
        this.activePuzzleHandler = handler;
    }

    // 2. ARASAKA: SECURITY QTE (Alpha Keys)
    startArasakaQTE() {
        if (this.puzzleActive) return;
        this.puzzleActive = true;

        const container = document.getElementById('puzzle-corp-qte');
        const promptEl = document.getElementById('qte-prompt');
        const fillEl = document.getElementById('qte-fill');
        container.classList.remove('hidden');

        // Difficulty Scaling
        // Level 1: 3 chars. Level 5: 7 chars.
        const sequenceLength = 3 + this.securityLevel;
        let currentStep = 0;
        const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let targetKey = "";

        // Speed scaling: Level 1 (2.0s) -> Level 5 (1.0s)
        const baseSpeed = Math.max(0.8, 2.2 - (this.securityLevel * 0.2));
        const speed = baseSpeed + "s";

        const nextKey = () => {
            if (currentStep >= sequenceLength) {
                document.removeEventListener('keydown', keyHandler);
                container.classList.add('hidden');
                this.log('corp', `SECURITY OVERRIDE: SUCCESS. (Lv ${this.securityLevel} -> ${this.securityLevel + 1})`, false);
                audio.playTyping('corp');
                this.puzzleActive = false;
                this.securityLevel++;
                return;
            }
            targetKey = keys[Math.floor(Math.random() * keys.length)];
            promptEl.innerText = `[ ${targetKey} ]`;

            // Random Timer Reset
            fillEl.style.transition = 'none';
            fillEl.style.width = '100%';
            setTimeout(() => {
                fillEl.style.transition = `width ${speed} linear`;
                fillEl.style.width = '0%';
            }, 10);

            this.activeQTE = targetKey;
        };

        const keyHandler = (e) => {
            if (!this.puzzleActive) return;
            if (e.key.toUpperCase() === targetKey) {
                currentStep++;
                nextKey();
            } else {
                // Fail
                this.log('corp', "AUTH FAILURE. RESETTING...", true);
                currentStep = 0;
                nextKey();
            }
        };

        document.addEventListener('keydown', keyHandler);
        nextKey();
        this.activePuzzleHandler = keyHandler;
    }

    // 3. NOMAD: ANALOG TUNER (Bracket Keys)
    startNomadTuner() {
        if (this.puzzleActive) return;
        this.puzzleActive = true;

        const container = document.getElementById('puzzle-nomad-tuner');
        const canvas = document.getElementById('tuner-canvas');
        const ctx = canvas.getContext('2d');
        const lockEl = document.getElementById('tuner-lock');
        container.classList.remove('hidden');

        let targetFreq = 20 + Math.random() * 80;
        let userFreq = 10;
        let tuning = true;

        // Difficulty Scaling: Drift Speed
        // Level 1: 0.02. Level 5: 0.10 (5x wobble)
        const driftSpeed = 0.02 * this.securityLevel;

        const loop = () => {
            if (!tuning) return;
            requestAnimationFrame(loop);

            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const t = Date.now() * 0.005;

            // Target Drifts slightly over time
            targetFreq += Math.sin(t) * driftSpeed;

            // Draw Target (Ghost Red)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 50, 50, 0.4)';
            ctx.lineWidth = 3;
            for (let x = 0; x < canvas.width; x++) {
                const y = 100 + Math.sin(x * (targetFreq / 1000) + t) * 50;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Draw User (Bright Orange)
            ctx.beginPath();
            ctx.strokeStyle = '#ffb833';
            ctx.lineWidth = 2;
            for (let x = 0; x < canvas.width; x++) {
                const y = 100 + Math.sin(x * (userFreq / 1000) + t) * 50;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Check Lock
            if (Math.abs(userFreq - targetFreq) < 5) {
                lockEl.innerText = "SIGNAL LOCKED";
                lockEl.style.color = "#00ff00";

                if (Math.abs(userFreq - targetFreq) < 2) {
                    // Win
                    tuning = false;
                    setTimeout(() => {
                        container.classList.add('hidden');
                        document.removeEventListener('keydown', keyHandler);
                        this.log('nomad', `SECURE LINK ESTABLISHED. (Lv ${this.securityLevel} -> ${this.securityLevel + 1})`, false);
                        audio.playTyping('nomad');
                        this.puzzleActive = false;
                        this.securityLevel++;
                    }, 1000);
                }
            } else {
                lockEl.innerText = "NO SIGNAL";
                lockEl.style.color = "#ffb833";
            }
        };

        const keyHandler = (e) => {
            if (!this.puzzleActive) return;
            if (e.key === ']') userFreq += 2;
            if (e.key === '[') userFreq -= 2;
            // Clamp
            if (userFreq < 1) userFreq = 1;
            if (userFreq > 150) userFreq = 150;
        };

        document.addEventListener('keydown', keyHandler);
        loop();
        this.activePuzzleHandler = keyHandler;
    }


}

// INIT GLOBAL
const audio = new AudioEngine();
const sys = new SystemCore();
document.addEventListener('DOMContentLoaded', () => sys.init());
