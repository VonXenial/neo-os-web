class BreachMinigame {
    constructor(systemCore) {
        this.core = systemCore;
        this.gridSize = 5;
        this.grid = [];
        this.buffer = [];
        this.bufferSize = 5;
        this.target = [];
        this.activeIndex = 0; // Row 0
        this.isRowTurn = true; // Start with Row
        this.timer = 0;
        this.interval = null;
        this.gameOver = false;

        this.hexCodes = ['1C', '55', 'BD', 'E9', '7A'];
    }

    start() {
        this.gameOver = false;
        this.buffer = [];
        this.isRowTurn = true;
        this.activeIndex = 0; // Row 0
        this.timer = 30.00;

        this.generateLevel();
        this.render();
        this.show();
        this.startTimer();
    }

    generateLevel() {
        // 1. Generate Random Grid
        this.grid = [];
        for (let r = 0; r < this.gridSize; r++) {
            let row = [];
            for (let c = 0; c < this.gridSize; c++) {
                row.push(this.hexCodes[Math.floor(Math.random() * this.hexCodes.length)]);
            }
            this.grid.push(row);
        }

        // 2. Generate Solvable Sequence (SIMPLIFIED for now: Random valid walk)
        // Ensure at least one path exists
        let path = [];
        let r = 0, c = Math.floor(Math.random() * this.gridSize);
        // Start from top row
        path.push(this.grid[r][c]);

        // Walk 3 steps (Row -> Col -> Row)
        // Step 1: Same Col, New Row
        let nextR = Math.floor(Math.random() * this.gridSize);
        while (nextR === r) nextR = Math.floor(Math.random() * this.gridSize);
        path.push(this.grid[nextR][c]);
        r = nextR;

        // Step 2: Same Row, New Col
        let nextC = Math.floor(Math.random() * this.gridSize);
        while (nextC === c) nextC = Math.floor(Math.random() * this.gridSize);
        path.push(this.grid[r][nextC]);

        this.target = path;
    }

    render() {
        const gridEl = document.getElementById('hex-grid');
        gridEl.innerHTML = '';

        // Render Grid
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'hex-cell';
                cell.innerText = this.grid[r][c];
                cell.dataset.r = r;
                cell.dataset.c = c;

                // Highlight Active Row/Col
                if (!this.gameOver) {
                    if (this.isRowTurn && r === this.activeIndex) cell.classList.add('active-row');
                    if (!this.isRowTurn && c === this.activeIndex) cell.classList.add('active-col');
                }

                cell.onclick = () => this.handleCellClick(r, c);
                gridEl.appendChild(cell);
            }
        }

        // Render Buffer
        const bufEl = document.getElementById('breach-buffer');
        bufEl.innerHTML = '';
        for (let i = 0; i < this.bufferSize; i++) {
            const slot = document.createElement('div');
            slot.className = `buffer-slot ${this.buffer[i] ? 'filled' : ''}`;
            slot.innerText = this.buffer[i] || '';
            bufEl.appendChild(slot);
        }

        // Render Target
        const tgtEl = document.getElementById('breach-target');
        tgtEl.innerHTML = this.target.map(h => `<span>${h}</span>`).join('');

        // Check Partial Match for coloring (Basic implementation)
        // To make it look cool, we could highlight matched parts
    }

    handleCellClick(r, c) {
        if (this.gameOver) return;

        // Validate Move
        // Must be in active Row (if isRowTurn) or Active Col (if !isRowTurn)
        if (this.isRowTurn && r !== this.activeIndex) return;
        if (!this.isRowTurn && c !== this.activeIndex) return;

        // Select
        const val = this.grid[r][c];
        this.buffer.push(val);

        // Play Sound
        audio.playTone(400 + (this.buffer.length * 100), 'sine', 0.1, 0.1);

        // Check Win/Loss
        if (this.checkWin()) {
            this.endGame(true);
            return;
        }

        if (this.buffer.length >= this.bufferSize) {
            this.endGame(false);
            return;
        }

        // Switch Turn
        this.isRowTurn = !this.isRowTurn;
        this.activeIndex = this.isRowTurn ? r : c; // If now Row turn, active index is current Row (clicked cell's row) -- WAIT.
        // Cyberpunk Rule:
        // Start Row 0. Pick (0, 2).
        // Next is Column 2. Pick (3, 2).
        // Next is Row 3.

        // If I picked (r, c).
        // If it was Row Turn (picked from Row r), next is Col c.
        // So activeIndex becomes c.
        // If it was Col Turn (picked from Col c), next is Row r.
        // So activeIndex becomes r.
        this.activeIndex = this.isRowTurn ? r : c; // Use new turn's relevant axis? No.

        // Correct Logic:
        // Clicked (r, c).
        // Next state: isRowTurn = !isRowTurn.
        // If next is Column Turn, we need to pick from Column c. So activeIndex = c.
        // If next is Row Turn, we need to pick from Row r. So activeIndex = r.
        this.activeIndex = this.isRowTurn ? r : c;
        // Wait, if I just toggled isRowTurn...
        // Ex: Start Row Turn. Click (0, 2). 
        // isRowTurn becomes False (Col Turn). activeIndex should be 2 (Col 2).
        // (0, 2) -> r=0, c=2.
        // Formula: activeIndex = c (if next is Col), r (if next is Row).
        // My formula: next isRowTurn is False. activeIndex = c. CORRECT.
        // Next: Click (3, 2). r=3, c=2.
        // isRowTurn becomes True. activeIndex = r = 3. CORRECT.

        this.render();
    }

    checkWin() {
        // Simple check: Does buffer text end with target text?
        const bufStr = this.buffer.join('');
        const tgtStr = this.target.join('');
        return bufStr.includes(tgtStr);
    }

    startTimer() {
        clearInterval(this.interval);
        const timerEl = document.getElementById('breach-timer');
        this.interval = setInterval(() => {
            this.timer -= 0.05;
            timerEl.innerText = this.timer.toFixed(2);
            if (this.timer <= 0) {
                this.endGame(false);
            }
        }, 50);
    }

    endGame(success) {
        this.gameOver = true;
        clearInterval(this.interval);
        const statusEl = document.getElementById('breach-status');

        if (success) {
            statusEl.innerText = "ACCESS GRANTED";
            statusEl.style.color = "#00ffcc";
            audio.playTyping('netrunner'); // Victory sound logic
            setTimeout(() => {
                this.hide();
                this.core.completeBreach(); // Callback to Core
            }, 1000);
        } else {
            statusEl.innerText = "BREACH FAILED";
            statusEl.style.color = "#ff3333";
            this.core.triggerAlarm(this.core.theme);
            setTimeout(() => {
                this.hide();
            }, 2000);
        }
    }

    show() {
        document.getElementById('breach-modal').classList.remove('hidden');
    }

    hide() {
        document.getElementById('breach-modal').classList.add('hidden');
    }
}
