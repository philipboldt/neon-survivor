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
            upgradeBtns: document.querySelectorAll('.upgrade-btn')
        };
        this.updateHighScores();
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
        
        this.updateHighScores(stats.time); // Using time as "score" for now
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

    updateHighScores(newScore) {
        let scores = [0, 0, 0];
        try {
            const saved = localStorage.getItem('neonSurvivorHighScores');
            if (saved) scores = JSON.parse(saved);
        } catch (e) {
            console.warn('LocalStorage not available', e);
        }

        if (newScore !== undefined) {
            scores.push(newScore);
            scores.sort((a, b) => b - a);
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
            scores.forEach((s, i) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${i + 1}.</span> <span>${s}s</span>`;
                listEl.appendChild(li);
            });
        };

        renderScores(this.els.startHighscores);
        renderScores(this.els.endHighscores);
    }
}
