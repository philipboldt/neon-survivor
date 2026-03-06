import { CONSTANTS } from './src/constants.js';
import { Player } from './src/Player.js';
import { Enemy } from './src/Enemy.js';
import { Projectile } from './src/Projectile.js';
import { ExperienceDot } from './src/ExperienceDot.js';
import { HealDot } from './src/HealDot.js';
import { UIManager } from './src/UIManager.js';
import { SpriteManager } from './src/SpriteManager.js';
import { SpatialGrid } from './src/SpatialGrid.js';

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UIManager();
        this.sprites = new SpriteManager();
        this.grid = new SpatialGrid(CONSTANTS.WORLD.WORLD_SIZE, 100);

        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.player = new Player();
        this.resetGameState();
        
        this.keys = {};
        this.init();
    }

    resetGameState() {
        this.enemies = [];
        this.projectiles = [];
        this.experienceDots = [];
        this.healDots = [];
        this.stars = [];
        
        this.startTime = Date.now();
        this.lastSpawnTime = 0;
        this.lastAttackTime = 0;
        this.gameRunning = false;
        this.isPaused = false;
        this.pendingUpgrades = 0;
        
        this.player = new Player(); // Reset player stats
        this.generateStars();
    }

    init() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        // Click to Start/Restart/Resume
        this.ui.els.startScreen.addEventListener('click', () => {
            if (!this.gameRunning) this.startGame();
        });

        this.ui.els.pauseScreen.addEventListener('click', () => {
            if (this.gameRunning && this.isPaused) {
                this.isPaused = false;
                this.ui.togglePause(false);
            }
        });

        if (this.ui.els.restartBtn) {
            this.ui.els.restartBtn.addEventListener('click', () => this.startGame());
        }

        // Upgrade Buttons
        this.ui.els.upgradeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                this.applyUpgrade(type);
            });
        });

        this.initSprites();
        this.resize();
        this.ui.showStartScreen();
        this.loop();
    }

    initSprites() {
        const padding = CONSTANTS.WORLD.SPRITE_PADDING;

        // Player Sprite
        const pSize = (CONSTANTS.PLAYER.RADIUS + padding) * 2;
        this.sprites.preRender('player', pSize, pSize, (ctx, cx, cy) => {
            ctx.strokeStyle = CONSTANTS.PLAYER.COLOR;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = CONSTANTS.PLAYER.COLOR;
            ctx.beginPath();
            ctx.arc(cx, cy, CONSTANTS.PLAYER.RADIUS, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Enemy Sprite
        const eSize = (CONSTANTS.ENEMY.SIZE + padding) * 2;
        this.sprites.preRender('enemy', eSize, eSize, (ctx, cx, cy) => {
            ctx.strokeStyle = CONSTANTS.ENEMY.COLOR;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = CONSTANTS.ENEMY.COLOR;
            ctx.strokeRect(cx - CONSTANTS.ENEMY.SIZE / 2, cy - CONSTANTS.ENEMY.SIZE / 2, CONSTANTS.ENEMY.SIZE, CONSTANTS.ENEMY.SIZE);
        });

        // Projectile Sprite
        const prSize = (CONSTANTS.PROJECTILE.SIZE + padding) * 2;
        this.sprites.preRender('projectile', prSize, prSize, (ctx, cx, cy) => {
            ctx.fillStyle = CONSTANTS.PROJECTILE.COLOR;
            ctx.shadowBlur = 10;
            ctx.shadowColor = CONSTANTS.PROJECTILE.COLOR;
            ctx.beginPath();
            ctx.arc(cx, cy, CONSTANTS.PROJECTILE.SIZE, 0, Math.PI * 2);
            ctx.fill();
        });

        // Exp Dot Sprite
        const exSize = (CONSTANTS.EXPERIENCE.SIZE + padding) * 2;
        this.sprites.preRender('expDot', exSize, exSize, (ctx, cx, cy) => {
            ctx.fillStyle = CONSTANTS.EXPERIENCE.COLOR;
            ctx.shadowBlur = 10;
            ctx.shadowColor = CONSTANTS.EXPERIENCE.COLOR;
            ctx.beginPath();
            ctx.arc(cx, cy, CONSTANTS.EXPERIENCE.SIZE, 0, Math.PI * 2);
            ctx.fill();
        });

        // Heal Dot Sprite
        const hSize = (CONSTANTS.HEAL.SIZE + padding) * 2;
        this.sprites.preRender('healDot', hSize, hSize, (ctx, cx, cy) => {
            ctx.fillStyle = CONSTANTS.HEAL.COLOR;
            ctx.shadowBlur = 15;
            ctx.shadowColor = CONSTANTS.HEAL.COLOR;
            ctx.beginPath();
            ctx.arc(cx, cy, CONSTANTS.HEAL.SIZE, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    applyUpgrade(type) {
        if (type === 'attack') {
            this.player.numProjectiles++;
        } else if (type === 'damage') {
            this.player.projectileDamage++;
        }

        this.pendingUpgrades--;
        if (this.pendingUpgrades <= 0) {
            this.pendingUpgrades = 0;
            this.isPaused = false;
            this.ui.hideUpgradeScreen();
        }
    }

    startGame() {
        this.resetGameState();
        this.gameRunning = true;
        this.ui.hideAll();
        this.startTime = Date.now();
    }

    handleKeyDown(e) {
        if (this.ui.nameInputActive) {
            this.ui.handleNameInputKey(e);
            return;
        }

        this.keys[e.code] = true;

        if (e.code === 'Space') {
            if (!this.gameRunning) {
                if (!this.ui.els.startScreen.classList.contains('hidden') || 
                    !this.ui.els.gameOverScreen.classList.contains('hidden')) {
                    this.startGame();
                }
            } else if (this.pendingUpgrades === 0) {
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
        
        // Calculate scale to fit fixed square viewport
        const viewSize = CONSTANTS.WORLD.VIEWPORT_SIZE;
        this.scale = Math.min(this.width / viewSize, this.height / viewSize);
        
        // Fixed game unit dimensions for the square viewport
        this.centerX = viewSize / 2;
        this.centerY = viewSize / 2;

        // Screen offsets to center the game box
        this.offsetX = (this.width - viewSize * this.scale) / 2;
        this.offsetY = (this.height - viewSize * this.scale) / 2;
    }

    spawnEnemy() {
        const now = Date.now();
        const survivalTime = (now - this.startTime) / 1000;
        const currentInterval = Math.max(100, CONSTANTS.ENEMY.SPAWN_INTERVAL - Math.floor(survivalTime / 15) * 50);

        if (now - this.lastSpawnTime > currentInterval) {
            const vSize = CONSTANTS.WORLD.VIEWPORT_SIZE;
            this.enemies.push(new Enemy(this.player.x, this.player.y, vSize, vSize));
            this.lastSpawnTime = now;
        }
    }

    handleAutoAttack() {
        const now = Date.now();
        if (now - this.lastAttackTime > this.player.cooldown) {
            // Find enemies in range
            const rangeSq = this.player.range * this.player.range;
            const enemiesInRange = this.enemies
                .map(enemy => {
                    const dx = enemy.x - this.player.x;
                    const dy = enemy.y - this.player.y;
                    const distSq = dx * dx + dy * dy;
                    return { enemy, distSq };
                })
                .filter(item => item.distSq < rangeSq)
                .sort((a, b) => a.distSq - b.distSq);

            if (enemiesInRange.length > 0) {
                // Shoot at multiple targets if available
                const shots = Math.min(this.player.numProjectiles, enemiesInRange.length);
                for (let i = 0; i < shots; i++) {
                    const target = enemiesInRange[i].enemy;
                    this.projectiles.push(new Projectile(this.player.x, this.player.y, target.x, target.y, this.player.range));
                }
                this.lastAttackTime = now;
            }
        }
    }

    update() {
        if (!this.gameRunning || this.isPaused) return;

        this.player.update(this.keys);
        this.handleAutoAttack();
        this.spawnEnemy();

        // Spatial Grid Update
        this.grid.clear();
        this.enemies.forEach(e => this.grid.insert(e));

        // Projectiles
        this.projectiles.forEach((p, index) => {
            p.update();
            if (p.dead) {
                this.projectiles.splice(index, 1);
                return;
            }
            
            // Optimization: Only check nearby enemies
            const nearbyEnemies = this.grid.getNearby(p.x, p.y);
            nearbyEnemies.forEach(enemy => {
                const dx = p.x - enemy.x;
                const dy = p.y - enemy.y;
                const distSq = dx * dx + dy * dy;
                const minDist = (enemy.size / 2 + p.size);
                if (distSq < minDist * minDist) {
                    enemy.health -= this.player.projectileDamage;
                    p.dead = true;
                    if (enemy.health <= 0) {
                        if (Math.random() < CONSTANTS.EXPERIENCE.HEAL_DROP_CHANCE) {
                            this.healDots.push(new HealDot(enemy.x, enemy.y));
                        } else {
                            this.experienceDots.push(new ExperienceDot(enemy.x, enemy.y, 1));
                        }
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
            const distSq = dx * dx + dy * dy;
            
            if (distSq < this.player.radius * this.player.radius) {
                const leveledUp = this.player.gainExperience(dot.value);
                if (leveledUp) {
                    this.pendingUpgrades++;
                    this.isPaused = true;
                    this.ui.showUpgradeScreen();
                }
                this.experienceDots.splice(index, 1);
            }
        });

        // Heal Dots
        this.healDots.forEach((dot, index) => {
            dot.update(this.player.x, this.player.y);
            const dx = this.player.x - dot.x;
            const dy = this.player.y - dot.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < this.player.radius * this.player.radius) {
                this.player.healFull();
                this.healDots.splice(index, 1);
            }
        });

        // Enemy AI & Collisions
        const now = Date.now();
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);
            
            const speed = CONSTANTS.ENEMY.MIN_SPEED + (1 - Math.min(dist, CONSTANTS.ENEMY.MAX_ACCEL_DIST) / CONSTANTS.ENEMY.MAX_ACCEL_DIST) * (CONSTANTS.ENEMY.MAX_SPEED - CONSTANTS.ENEMY.MIN_SPEED);
            
            if (dist > 0) {
                enemy.x += (dx / dist) * speed;
                enemy.y += (dy / dist) * speed;
            }

            // Enemy vs Player collision & Damage
            const minPDist = this.player.radius + enemy.size / 2;
            if (distSq < minPDist * minPDist && dist > 0) {
                enemy.x = this.player.x + ((enemy.x - this.player.x) / dist) * minPDist;
                enemy.y = this.player.y + ((enemy.y - this.player.y) / dist) * minPDist;

                if (!enemy.lastAttackTime) enemy.lastAttackTime = 0;
                if (now - enemy.lastAttackTime > CONSTANTS.ENEMY.ATTACK_COOLDOWN) {
                    this.player.takeDamage(CONSTANTS.ENEMY.DAMAGE);
                    enemy.lastAttackTime = now;
                }
            }

            // Enemy vs Enemy collisions (using Grid)
            const nearby = this.grid.getNearby(enemy.x, enemy.y);
            nearby.forEach(other => {
                if (enemy === other) return;
                const edx = enemy.x - other.x;
                const edy = enemy.y - other.y;
                const edistSq = edx * edx + edy * edy;
                const minDist = enemy.size;
                if (edistSq < minDist * minDist && edistSq > 0) {
                    const edist = Math.sqrt(edistSq);
                    const overlap = (minDist - edist) / 2;
                    enemy.x += (edx / edist) * overlap;
                    enemy.y += (edy / edist) * overlap;
                    other.x -= (edx / edist) * overlap;
                    other.y -= (edy / edist) * overlap;
                }
            });
        });

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
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = '#050505'; // Letterbox color
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();

        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);

        const vSize = CONSTANTS.WORLD.VIEWPORT_SIZE;
        
        // Clip to square viewport
        this.ctx.beginPath();
        this.ctx.rect(0, 0, vSize, vSize);
        this.ctx.clip();

        // Game Background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, vSize, vSize);

        const viewLeft = this.player.x - this.centerX;
        const viewRight = this.player.x + this.centerX;
        const viewTop = this.player.y - this.centerY;
        const viewBottom = this.player.y + this.centerY;

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
            
            if (sx < vSize && sy < vSize) {
                this.ctx.globalAlpha = star.opacity;
                this.ctx.beginPath();
                this.ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        this.ctx.globalAlpha = 1.0;

        // Frustum Culling helper
        const isVisible = (e) => {
            return e.x > viewLeft - 50 && e.x < viewRight + 50 &&
                   e.y > viewTop - 50 && e.y < viewBottom + 50;
        };

        this.experienceDots.forEach(dot => {
            if (isVisible(dot)) dot.draw(this.ctx, this.player.x, this.player.y, this.centerX, this.centerY, this.sprites.get('expDot'));
        });
        this.healDots.forEach(dot => {
            if (isVisible(dot)) dot.draw(this.ctx, this.player.x, this.player.y, this.centerX, this.centerY, this.sprites.get('healDot'));
        });
        
        this.player.draw(this.ctx, this.centerX, this.centerY, vSize, vSize, this.sprites.get('player'));
        
        this.enemies.forEach(e => {
            if (isVisible(e)) e.draw(this.ctx, this.player.x, this.player.y, this.centerX, this.centerY, this.sprites.get('enemy'));
        });
        
        this.projectiles.forEach(p => {
            if (isVisible(p)) p.draw(this.ctx, this.player.x, this.player.y, this.centerX, this.centerY, this.sprites.get('projectile'));
        });
        
        this.ctx.restore();
    }

    loop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }
}

new GameEngine();
