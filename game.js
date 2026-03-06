import { CONSTANTS } from './src/constants.js';
import { Player } from './src/Player.js';
import { Enemy } from './src/Enemy.js';
import { Projectile } from './src/Projectile.js';
import { ExperienceDot } from './src/ExperienceDot.js';
import { UIManager } from './src/UIManager.js';

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UIManager();

        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;

        this.player = new Player();
        this.resetGameState();
        
        this.keys = {};
        this.init();
    }

    resetGameState() {
        this.enemies = [];
        this.projectiles = [];
        this.experienceDots = [];
        this.stars = [];
        
        this.startTime = Date.now();
        this.lastSpawnTime = 0;
        this.lastAttackTime = 0;
        this.gameRunning = false;
        this.isPaused = false;
        
        this.player = new Player(); // Reset player stats
        this.generateStars();
    }

    init() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        if (this.ui.els.restartBtn) {
            this.ui.els.restartBtn.addEventListener('click', () => this.startGame());
        }

        this.resize();
        this.ui.showStartScreen();
        this.loop();
    }

    startGame() {
        this.resetGameState();
        this.gameRunning = true;
        this.ui.hideAll();
        this.startTime = Date.now();
    }

    handleKeyDown(e) {
        this.keys[e.code] = true;

        if (e.code === 'Space') {
            if (!this.gameRunning && !this.ui.els.startScreen.classList.contains('hidden')) {
                this.startGame();
            } else if (this.gameRunning) {
                this.isPaused = !this.isPaused;
                this.ui.togglePause(this.isPaused);
            }
        }
    }

    generateStars() {
        const { STAR_COUNT, WORLD_SIZE } = CONSTANTS.WORLD;
        for (let i = 0; i < STAR_COUNT; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * WORLD_SIZE,
                y: (Math.random() - 0.5) * WORLD_SIZE,
                size: Math.random() * 2,
                opacity: 0.2 + Math.random() * 0.5
            });
        }
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    spawnEnemy() {
        const now = Date.now();
        if (now - this.lastSpawnTime > CONSTANTS.ENEMY.SPAWN_INTERVAL) {
            this.enemies.push(new Enemy(this.player.x, this.player.y, this.width, this.height));
            this.lastSpawnTime = now;
        }
    }

    handleAutoAttack() {
        const now = Date.now();
        if (now - this.lastAttackTime > this.player.cooldown) {
            let nearestEnemy = null;
            let minDist = this.player.range;

            this.enemies.forEach(enemy => {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                    minDist = dist;
                    nearestEnemy = enemy;
                }
            });

            if (nearestEnemy) {
                this.projectiles.push(new Projectile(this.player.x, this.player.y, nearestEnemy.x, nearestEnemy.y));
                this.lastAttackTime = now;
            }
        }
    }

    update() {
        if (!this.gameRunning || this.isPaused) return;

        this.player.update(this.keys);
        this.handleAutoAttack();
        this.spawnEnemy();

        // Projectiles
        this.projectiles.forEach((p, index) => {
            p.update();
            if (p.life <= 0) {
                this.projectiles.splice(index, 1);
                return;
            }
            this.enemies.forEach(enemy => {
                const dx = p.x - enemy.x;
                const dy = p.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < enemy.size / 2 + p.size) {
                    enemy.health -= 1;
                    p.life = 0;
                    if (enemy.health <= 0) {
                        this.experienceDots.push(new ExperienceDot(enemy.x, enemy.y, 1));
                    }
                }
            });
        });

        this.enemies = this.enemies.filter(enemy => enemy.health > 0);

        // Experience Dots
        this.experienceDots.forEach((dot, index) => {
            dot.update(this.player.x, this.player.y);
            const dx = this.player.x - dot.x;
            const dy = this.player.y - dot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.player.radius) {
                this.player.gainExperience(dot.value);
                this.experienceDots.splice(index, 1);
            }
        });

        // Enemy AI & Collisions
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const speed = CONSTANTS.ENEMY.MIN_SPEED + (1 - Math.min(dist, CONSTANTS.ENEMY.MAX_ACCEL_DIST) / CONSTANTS.ENEMY.MAX_ACCEL_DIST) * (CONSTANTS.ENEMY.MAX_SPEED - CONSTANTS.ENEMY.MIN_SPEED);
            
            if (dist > 0) {
                enemy.x += (dx / dist) * speed;
                enemy.y += (dy / dist) * speed;
            }

            // Enemy vs Player collision & Damage
            const pDist = Math.sqrt((enemy.x - this.player.x)**2 + (enemy.y - this.player.y)**2);
            const minPDist = this.player.radius + enemy.size / 2;
            if (pDist < minPDist && pDist > 0) {
                enemy.x = this.player.x + ((enemy.x - this.player.x) / pDist) * minPDist;
                enemy.y = this.player.y + ((enemy.y - this.player.y) / pDist) * minPDist;

                const now = Date.now();
                if (!enemy.lastAttackTime) enemy.lastAttackTime = 0;
                if (now - enemy.lastAttackTime > CONSTANTS.ENEMY.ATTACK_COOLDOWN) {
                    this.player.takeDamage(CONSTANTS.ENEMY.DAMAGE);
                    enemy.lastAttackTime = now;
                }
            }
        });

        // Enemy vs Enemy collisions
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < this.enemies.length; j++) {
                for (let k = j + 1; k < this.enemies.length; k++) {
                    const e1 = this.enemies[j];
                    const e2 = this.enemies[k];
                    const dx = e1.x - e2.x;
                    const dy = e1.y - e2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < e1.size && dist > 0) {
                        const overlap = (e1.size - dist) / 2;
                        e1.x += (dx / dist) * overlap;
                        e1.y += (dy / dist) * overlap;
                        e2.x -= (dx / dist) * overlap;
                        e2.y -= (dy / dist) * overlap;
                    }
                }
            }
        }

        const survivalTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.ui.updateTime(survivalTime);

        if (this.player.health <= 0) {
            this.gameRunning = false;
            this.ui.showGameOver({
                time: survivalTime,
                level: this.player.level
            });
        }
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Render World Border
        const halfSize = CONSTANTS.WORLD.WORLD_SIZE / 2;
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(
            -halfSize - this.player.x + this.centerX,
            -halfSize - this.player.y + this.centerY,
            CONSTANTS.WORLD.WORLD_SIZE,
            CONSTANTS.WORLD.WORLD_SIZE
        );

        // Stars
        this.ctx.fillStyle = CONSTANTS.WORLD.STAR_COLOR;
        this.stars.forEach(star => {
            let sx = (star.x - this.player.x + this.centerX) % CONSTANTS.WORLD.WORLD_SIZE;
            let sy = (star.y - this.player.y + this.centerY) % CONSTANTS.WORLD.WORLD_SIZE;
            if (sx < 0) sx += CONSTANTS.WORLD.WORLD_SIZE;
            if (sy < 0) sy += CONSTANTS.WORLD.WORLD_SIZE;
            if (sx < this.width && sy < this.height) {
                this.ctx.globalAlpha = star.opacity;
                this.ctx.beginPath();
                this.ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        this.ctx.globalAlpha = 1.0;

        this.experienceDots.forEach(dot => dot.draw(this.ctx, this.player.x, this.player.y, this.centerX, this.centerY));
        this.player.draw(this.ctx, this.centerX, this.centerY, this.width, this.height);
        this.enemies.forEach(e => e.draw(this.ctx, this.player.x, this.player.y, this.centerX, this.centerY));
        this.projectiles.forEach(p => p.draw(this.ctx, this.player.x, this.player.y, this.centerX, this.centerY));
    }

    loop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }
}

new GameEngine();
