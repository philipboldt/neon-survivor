export class UIManager {
    constructor() {
        this.els = {
            startScreen: document.getElementById('start-screen'),
            pauseScreen: document.getElementById('pause-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            time: document.getElementById('time'),
            finalTime: document.getElementById('final-time'),
            finalLevel: document.getElementById('final-level'),
            restartBtn: document.getElementById('restart-btn'),
            startHighscores: document.getElementById('start-highscore-list'),
            endHighscores: document.getElementById('end-highscore-list'),
            upgradeScreen: document.getElementById('upgrade-screen'),
            upgradeBtns: document.querySelectorAll('.upgrade-btn'),
            nameInputContainer: document.getElementById('name-input-container'),
            saveNameBtn: document.getElementById('save-name'),
            charEls: document.querySelectorAll('.arcade-input .char'),
            touchArrows: document.querySelectorAll('.touch-arrow')
        };

        this.nameInputActive = false;
        this.currentCharIndex = 0;
        this.chars = ['A', 'A', 'A'];
        this.pendingScore = 0;

        this.updateHighScores();
        this.bindNameInputTouch();
    }

    bindNameInputTouch() {
        this.els.touchArrows.forEach(arrow => {
            arrow.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const index = parseInt(arrow.dataset.index);
                const dir = arrow.dataset.dir;
                this.currentCharIndex = index;
                this.changeChar(index, dir === 'up' ? 1 : -1);
            });
        });

        if (this.els.saveNameBtn) {
            this.els.saveNameBtn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.saveHighscore();
            });
        }

        this.els.charEls.forEach((charEl, index) => {
            charEl.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.currentCharIndex = index;
                this.updateCharDisplay();
            });
        });
    }

    changeChar(index, delta) {
        let charCode = this.chars[index].charCodeAt(0);
        // A-Z is 65-90
        charCode = ((charCode - 65 + delta + 26) % 26) + 65;
        this.chars[index] = String.fromCharCode(charCode);
        this.updateCharDisplay();
    }

    updateCharDisplay() {
        this.els.charEls.forEach((el, i) => {
            el.textContent = this.chars[i];
            el.classList.toggle('active', i === this.currentCharIndex);
        });
    }

    showStartScreen() {
        this.els.startScreen.classList.remove('hidden');
        this.els.pauseScreen.classList.add('hidden');
        this.els.gameOverScreen.classList.add('hidden');
        this.els.upgradeScreen.classList.add('hidden');
        this.updateHighScores();
    }

    showGameOver(stats) {
        this.els.gameOverScreen.classList.remove('hidden');
        this.els.startScreen.classList.add('hidden');
        this.els.pauseScreen.classList.add('hidden');
        this.els.upgradeScreen.classList.add('hidden');
        
        this.els.finalTime.textContent = stats.time;
        this.els.finalLevel.textContent = stats.level;

        if (this.isHighscore(stats.time)) {
            this.showNameInput(stats.time);
        } else {
            this.nameInputActive = false;
            this.els.nameInputContainer.classList.add('hidden');
            this.updateHighScores();
        }
    }

    showNameInput(score) {
        this.pendingScore = score;
        this.nameInputActive = true;
        this.currentCharIndex = 0;
        this.chars = ['A', 'A', 'A'];
        this.updateCharDisplay();
        this.els.nameInputContainer.classList.remove('hidden');
    }

    handleNameInputKey(e) {
        if (!this.nameInputActive) return;

        if (e.code === 'ArrowLeft') {
            this.currentCharIndex = (this.currentCharIndex - 1 + 3) % 3;
        } else if (e.code === 'ArrowRight') {
            this.currentCharIndex = (this.currentCharIndex + 1) % 3;
        } else if (e.code === 'ArrowUp') {
            this.changeChar(this.currentCharIndex, 1);
        } else if (e.code === 'ArrowDown') {
            this.changeChar(this.currentCharIndex, -1);
        } else if (e.code === 'Enter') {
            this.saveHighscore();
            return;
        }
        this.updateCharDisplay();
        e.preventDefault();
    }

    saveHighscore() {
        const name = this.chars.join('');
        this.updateHighScores({ name, score: this.pendingScore });
        this.nameInputActive = false;
        this.els.nameInputContainer.classList.add('hidden');
    }

    showUpgradeScreen() {
        this.els.upgradeScreen.classList.remove('hidden');
    }

    hideUpgradeScreen() {
        this.els.upgradeScreen.classList.add('hidden');
    }

    togglePause(isPaused) {
        if (isPaused) {
            this.els.pauseScreen.classList.remove('hidden');
        } else {
            this.els.pauseScreen.classList.add('hidden');
        }
    }

    hideAll() {
        this.els.startScreen.classList.add('hidden');
        this.els.pauseScreen.classList.add('hidden');
        this.els.gameOverScreen.classList.add('hidden');
        this.els.upgradeScreen.classList.add('hidden');
    }

    updateTime(seconds) {
        this.els.time.textContent = seconds;
    }

    updateHighScores(newEntry) {
        let scores = [];
        try {
            const saved = localStorage.getItem('neonSurvivorHighScores');
            if (saved) {
                scores = JSON.parse(saved);
                // Migration: convert old number-only scores to objects
                if (scores.length > 0 && typeof scores[0] === 'number') {
                    scores = scores.map(s => ({ name: '???' , score: s }));
                }
            } else {
                scores = [
                    { name: 'NEO', score: 100 },
                    { name: 'TRN', score: 50 },
                    { name: 'FLY', score: 25 }
                ];
            }
        } catch (e) {
            console.warn('LocalStorage not available', e);
        }

        if (newEntry !== undefined) {
            scores.push(newEntry);
            scores.sort((a, b) => b.score - a.score);
            scores = scores.slice(0, 3);
            try {
                localStorage.setItem('neonSurvivorHighScores', JSON.stringify(scores));
            } catch (e) {
                console.warn('Failed to save highscore', e);
            }
        }

        const renderScores = (listEl) => {
            if (!listEl) return;
            listEl.innerHTML = '';
            scores.forEach((entry, i) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${i + 1}. ${entry.name}</span> <span>${entry.score}s</span>`;
                listEl.appendChild(li);
            });
        };

        renderScores(this.els.startHighscores);
        renderScores(this.els.endHighscores);
    }

    isHighscore(score) {
        let scores = [];
        try {
            const saved = localStorage.getItem('neonSurvivorHighScores');
            if (saved) {
                scores = JSON.parse(saved);
                if (scores.length > 0 && typeof scores[0] === 'number') {
                    scores = scores.map(s => ({ name: '???' , score: s }));
                }
            } else {
                scores = [{ score: 100 }, { score: 50 }, { score: 25 }];
            }
        } catch (e) {
            return false;
        }
        return scores.length < 3 || score > scores[scores.length - 1].score;
    }
}
