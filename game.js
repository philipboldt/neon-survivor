import { CONSTANTS } from './src/constants.js';
import { Player } from './src/Player.js';
import { Enemy } from './src/Enemy.js';
import { Projectile } from './src/Projectile.js';
import { ExperienceDot } from './src/ExperienceDot.js';
import { HealDot } from './src/HealDot.js';
import { MagnetDot } from './src/MagnetDot.js';
import { GoldDot } from './src/GoldDot.js';
import { Box } from './src/Box.js';
import { UIManager } from './src/UIManager.js';
import { SpriteManager } from './src/SpriteManager.js';
import { SpatialGrid } from './src/SpatialGrid.js';

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UIManager();
        this.sprites = new SpriteManager();
        this.grid = new SpatialGrid(CONSTANTS.WORLD.WORLD_SIZE, CONSTANTS.WORLD.GRID_CELL_SIZE);

        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.player = new Player();
        this.starTiles = [];
        this.resetGameState();
        
        this.keys = {};
        this.init();
    }

    resetGameState() {
        this.enemies = [];
        this.boxes = [];
        this.projectiles = [];
        this.experienceDots = [];
        this.healDots = [];
        this.magnetDots = [];
        this.goldDots = [];
        this.stars = [];
        
        this.startTime = Date.now();
        this.lastSpawnTime = 0;
        this.lastBossSpawnTime = Date.now();
        this.lastAttackTime = 0;
        this.orbitalAngle = 0;
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
        this.generateStarTiles();
        this.resize();
        this.ui.showStartScreen();
        this.loop();
    }

    generateStarTiles() {
        const { WORLD_SIZE, STAR_TILE_SIZE, STAR_COUNT, STAR_COLOR } = CONSTANTS.WORLD;
        const numTiles = Math.ceil(WORLD_SIZE / STAR_TILE_SIZE);
        const starsPerTile = Math.floor(STAR_COUNT / (numTiles * numTiles));

        this.starTiles = [];

        for (let ty = 0; ty < numTiles; ty++) {
            for (let tx = 0; tx < numTiles; tx++) {
                const offscreen = document.createElement('canvas');
                offscreen.width = STAR_TILE_SIZE;
                offscreen.height = STAR_TILE_SIZE;
                const octx = offscreen.getContext('2d');

                octx.fillStyle = STAR_COLOR;
                for (let i = 0; i < starsPerTile; i++) {
                    const x = Math.random() * STAR_TILE_SIZE;
                    const y = Math.random() * STAR_TILE_SIZE;
                    const size = Math.random() * 2;
                    const opacity = 0.2 + Math.random() * 0.5;

                    octx.globalAlpha = opacity;
                    octx.beginPath();
                    octx.arc(x, y, size, 0, Math.PI * 2);
                    octx.fill();
                }
                
                this.starTiles.push({
                    canvas: offscreen,
                    x: (tx * STAR_TILE_SIZE) - WORLD_SIZE / 2,
                    y: (ty * STAR_TILE_SIZE) - WORLD_SIZE / 2
                });
            }
        }
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

        // Mini Boss Sprite
        const bSize = (CONSTANTS.MINI_BOSS.SIZE + padding) * 2;
        this.sprites.preRender('boss', bSize, bSize, (ctx, cx, cy) => {
            ctx.strokeStyle = CONSTANTS.MINI_BOSS.COLOR;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 25;
            ctx.shadowColor = CONSTANTS.MINI_BOSS.COLOR;
            ctx.strokeRect(cx - CONSTANTS.MINI_BOSS.SIZE / 2, cy - CONSTANTS.MINI_BOSS.SIZE / 2, CONSTANTS.MINI_BOSS.SIZE, CONSTANTS.MINI_BOSS.SIZE);
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

        // Orbital Sprite
        const oSize = (CONSTANTS.ORBITAL.SIZE + padding) * 2;
        this.sprites.preRender('orbital', oSize, oSize, (ctx, cx, cy) => {
            ctx.fillStyle = CONSTANTS.ORBITAL.COLOR;
            ctx.shadowBlur = 15;
            ctx.shadowColor = CONSTANTS.ORBITAL.COLOR;
            ctx.beginPath();
            ctx.arc(cx, cy, CONSTANTS.ORBITAL.SIZE, 0, Math.PI * 2);
            ctx.fill();
        });

        // Box Sprite
        const boxSize = (CONSTANTS.BOX.SIZE + padding) * 2;
        this.sprites.preRender('box', boxSize, boxSize, (ctx, cx, cy) => {
            ctx.strokeStyle = CONSTANTS.BOX.COLOR;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = CONSTANTS.BOX.GLOW;
            ctx.strokeRect(cx - CONSTANTS.BOX.SIZE / 2, cy - CONSTANTS.BOX.SIZE / 2, CONSTANTS.BOX.SIZE, CONSTANTS.BOX.SIZE);
            // Inner detail
            ctx.strokeRect(cx - CONSTANTS.BOX.SIZE / 4, cy - CONSTANTS.BOX.SIZE / 4, CONSTANTS.BOX.SIZE / 2, CONSTANTS.BOX.SIZE / 2);
        });

        // Magnet Sprite
        const mSize = (CONSTANTS.MAGNET.SIZE + padding) * 2;
        this.sprites.preRender('magnet', mSize, mSize, (ctx, cx, cy) => {
            ctx.fillStyle = CONSTANTS.MAGNET.COLOR;
            ctx.shadowBlur = 10;
            ctx.shadowColor = CONSTANTS.MAGNET.GLOW;
            ctx.beginPath();
            ctx.arc(cx, cy, CONSTANTS.MAGNET.SIZE, 0, Math.PI * 2);
            ctx.fill();
        });

        // Gold Sprite
        const gSize = (CONSTANTS.GOLD.SIZE + padding) * 2;
        this.sprites.preRender('gold', gSize, gSize, (ctx, cx, cy) => {
            ctx.fillStyle = CONSTANTS.GOLD.COLOR;
            ctx.shadowBlur = 10;
            ctx.shadowColor = CONSTANTS.GOLD.GLOW;
            ctx.beginPath();
            ctx.arc(cx, cy, CONSTANTS.GOLD.SIZE, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    applyUpgrade(type) {
        if (type === 'attack') {
            this.player.numProjectiles++;
        } else if (type === 'damage') {
            this.player.projectileDamage++;
        } else if (type === 'orbital') {
            this.player.numOrbitals++;
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

        // Mini Boss Spawning every 60 seconds
        if (now - this.lastBossSpawnTime > CONSTANTS.MINI_BOSS.SPAWN_INTERVAL) {
            const vSize = CONSTANTS.WORLD.VIEWPORT_SIZE;
            this.enemies.push(new Enemy(this.player.x, this.player.y, vSize, vSize, 'boss'));
            this.lastBossSpawnTime = now;
            this.ui.showBossNotification();

            // Spawn up to 4 boxes, one in each quarter if unoccupied
            const spawnPositions = [
                { x: -1500, y: -1500 },
                { x: 1500, y: -1500 },
                { x: -1500, y: 1500 },
                { x: 1500, y: 1500 }
            ];

            spawnPositions.forEach(pos => {
                // Check if a box already exists near this position
                const alreadyExists = this.boxes.some(b => 
                    Math.abs(b.x - pos.x) < 100 && Math.abs(b.y - pos.y) < 100
                );
                
                if (!alreadyExists && this.boxes.length < CONSTANTS.BOX.MAX_COUNT) {
                    this.boxes.push(new Box(pos.x, pos.y));
                }
            });
        }

        const currentInterval = Math.max(100, CONSTANTS.ENEMY.SPAWN_INTERVAL - Math.floor(survivalTime / 15) * 50);

        if (now - this.lastSpawnTime > currentInterval) {
            const vSize = CONSTANTS.WORLD.VIEWPORT_SIZE;
            this.enemies.push(new Enemy(this.player.x, this.player.y, vSize, vSize));
            this.lastSpawnTime = now;
        }
    }

    handleAutoAttack() {
        const now = Date.now();
        
        // Weapon priming logic: Check if we are ready to fire
        if (now - this.lastAttackTime >= this.player.cooldown) {
            // Find enemies in range using Spatial Grid for optimization
            const rangeSq = this.player.range * this.player.range;
            
            // Query the exact range area
            const nearbyEnemies = this.grid.getInRegion(
                this.player.x - this.player.range, 
                this.player.y - this.player.range, 
                this.player.x + this.player.range, 
                this.player.y + this.player.range
            );
            
            const enemiesInRange = nearbyEnemies
                .map(enemy => {
                    const dx = enemy.x - this.player.x;
                    const dy = enemy.y - this.player.y;
                    const distSq = dx * dx + dy * dy;
                    return { enemy, distSq };
                })
                .filter(item => item.distSq < rangeSq)
                .sort((a, b) => a.distSq - b.distSq);

            // Fire immediately if enemies are in range, otherwise weapon stays "primed"
            if (enemiesInRange.length > 0) {
                const shots = Math.min(this.player.numProjectiles, enemiesInRange.length);
                for (let i = 0; i < shots; i++) {
                    const target = enemiesInRange[i].enemy;
                    this.projectiles.push(new Projectile(this.player.x, this.player.y, target.x, target.y, this.player.range));
                }
                // Reset cooldown only AFTER firing
                this.lastAttackTime = now;
            }
        }
    }

    handleObstacleCollision(entity, radius) {
        const obsSize = CONSTANTS.WORLD.OBSTACLE_SIZE;
        const halfObs = obsSize / 2;
        
        for (const obs of CONSTANTS.WORLD.OBSTACLES) {
            // Check if entity is within obstacle bounds (with radius)
            if (entity.x > obs.x - halfObs - radius &&
                entity.x < obs.x + halfObs + radius &&
                entity.y > obs.y - halfObs - radius &&
                entity.y < obs.y + halfObs + radius) {
                
                // Determine which side is closest to push out
                const dxLeft = entity.x - (obs.x - halfObs - radius);
                const dxRight = (obs.x + halfObs + radius) - entity.x;
                const dyTop = entity.y - (obs.y - halfObs - radius);
                const dyBottom = (obs.y + halfObs + radius) - entity.y;
                
                const min = Math.min(dxLeft, dxRight, dyTop, dyBottom);
                
                if (min === dxLeft) entity.x = obs.x - halfObs - radius;
                else if (min === dxRight) entity.x = obs.x + halfObs + radius;
                else if (min === dyTop) entity.y = obs.y - halfObs - radius;
                else if (min === dyBottom) entity.y = obs.y + halfObs + radius;

                return true; // Collision occurred
            }
        }
        return false;
    }

    update() {
        if (!this.gameRunning || this.isPaused) return;

        this.player.update(this.keys);
        this.handleObstacleCollision(this.player, this.player.radius);

        this.handleAutoAttack();
        this.spawnEnemy();

        // Update Orbitals
        if (this.player.numOrbitals > 0) {
            this.orbitalAngle += CONSTANTS.ORBITAL.ROTATION_SPEED;
            const orbitRadius = this.player.range * CONSTANTS.ORBITAL.RANGE_FACTOR;
            
            for (let i = 0; i < this.player.numOrbitals; i++) {
                const angle = this.orbitalAngle + (i * (Math.PI * 2) / this.player.numOrbitals);
                const ox = this.player.x + Math.cos(angle) * orbitRadius;
                const oy = this.player.y + Math.sin(angle) * orbitRadius;

                // Collision with enemies
                const nearby = this.grid.getNearby(ox, oy);
                const orbSizeSq = (CONSTANTS.ORBITAL.SIZE / 2 + CONSTANTS.ENEMY.SIZE / 2) ** 2;

                nearby.forEach(enemy => {
                    const dx = ox - enemy.x;
                    const dy = oy - enemy.y;
                    if (dx * dx + dy * dy < orbSizeSq) {
                        enemy.health -= CONSTANTS.ORBITAL.DAMAGE;
                        if (enemy.health <= 0) {
                            if (Math.random() < CONSTANTS.EXPERIENCE.HEAL_DROP_CHANCE) {
                                this.healDots.push(new HealDot(enemy.x, enemy.y));
                            } else {
                                const dots = enemy.type === 'boss' ? CONSTANTS.MINI_BOSS.EXP_VALUE : 1;
                                for (let j = 0; j < dots; j++) {
                                    const oxDot = (Math.random() - 0.5) * CONSTANTS.EXPERIENCE.DROP_SPREAD;
                                    const oyDot = (Math.random() - 0.5) * CONSTANTS.EXPERIENCE.DROP_SPREAD;
                                    this.experienceDots.push(new ExperienceDot(enemy.x + oxDot, enemy.y + oyDot, 1));
                                }
                            }
                        }
                    }
                });
            }
        }

        // Spatial Grid Update
        this.grid.clear();
        this.enemies.forEach(e => this.grid.insert(e));
        this.boxes.forEach(b => this.grid.insert(b));

        // Projectiles
        this.projectiles.forEach((p, index) => {
            p.update();
            if (p.dead) {
                this.projectiles.splice(index, 1);
                return;
            }

            // Obstacle collision for projectiles
            if (this.handleObstacleCollision(p, p.size)) {
                p.dead = true;
                return;
            }
            
            // Optimization: Only check nearby entities
            const nearbyEntities = this.grid.getNearby(p.x, p.y);
            nearbyEntities.forEach(entity => {
                const dx = p.x - entity.x;
                const dy = p.y - entity.y;
                const distSq = dx * dx + dy * dy;
                const minDist = (entity.size / 2 + p.size);
                if (distSq < minDist * minDist) {
                    entity.health -= this.player.projectileDamage;
                    p.dead = true;
                    if (entity.health <= 0) {
                        if (entity instanceof Box) {
                            if (Math.random() < 0.5) {
                                this.magnetDots.push(new MagnetDot(entity.x, entity.y));
                            } else {
                                this.goldDots.push(new GoldDot(entity.x, entity.y));
                            }
                        } else {
                            if (Math.random() < CONSTANTS.EXPERIENCE.HEAL_DROP_CHANCE) {
                                this.healDots.push(new HealDot(entity.x, entity.y));
                            } else {
                                const dots = entity.type === 'boss' ? CONSTANTS.MINI_BOSS.EXP_VALUE : 1;
                                for (let i = 0; i < dots; i++) {
                                    const ox = (Math.random() - 0.5) * CONSTANTS.EXPERIENCE.DROP_SPREAD;
                                    const oy = (Math.random() - 0.5) * CONSTANTS.EXPERIENCE.DROP_SPREAD;
                                    this.experienceDots.push(new ExperienceDot(entity.x + ox, entity.y + oy, 1));
                                }
                            }
                        }
                    }
                }
            });
        });

        this.enemies = this.enemies.filter(enemy => enemy.health > 0);
        this.boxes = this.boxes.filter(box => box.health > 0);

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

        // Magnet Dots
        this.magnetDots.forEach((dot, index) => {
            dot.update(this.player.x, this.player.y);
            const dx = this.player.x - dot.x;
            const dy = this.player.y - dot.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < this.player.radius * this.player.radius) {
                // Trigger Magnet: All EXP dots start following
                this.experienceDots.forEach(exp => exp.isFollowing = true);
                this.magnetDots.splice(index, 1);
            }
        });

        // Gold Dots
        this.goldDots.forEach((dot, index) => {
            dot.update(this.player.x, this.player.y);
            const dx = this.player.x - dot.x;
            const dy = this.player.y - dot.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < this.player.radius * this.player.radius) {
                this.player.gold++;
                this.ui.updateGold(this.player.gold);
                this.goldDots.splice(index, 1);
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

            this.handleObstacleCollision(enemy, enemy.size / 2);

            // Enemy vs Player collision & Damage
            const minPDist = this.player.radius + enemy.size / 2;
            if (distSq < minPDist * minPDist && dist > 0) {
                enemy.x = this.player.x + ((enemy.x - this.player.x) / dist) * minPDist;
                enemy.y = this.player.y + ((enemy.y - this.player.y) / dist) * minPDist;

                if (!enemy.lastAttackTime) enemy.lastAttackTime = 0;
                if (now - enemy.lastAttackTime > CONSTANTS.ENEMY.ATTACK_COOLDOWN) {
                    this.player.takeDamage(enemy.damage);
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
                const minDist = (enemy.size + other.size) / 2;
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
        this.ctx.fillStyle = CONSTANTS.WORLD.LETTERBOX_COLOR;
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
        this.ctx.fillStyle = CONSTANTS.WORLD.BG_COLOR;
        this.ctx.fillRect(0, 0, vSize, vSize);

        const viewLeft = this.player.x - this.centerX;
        const viewRight = this.player.x + this.centerX;
        const viewTop = this.player.y - this.centerY;
        const viewBottom = this.player.y + this.centerY;

        // Render World Border
        const halfSize = CONSTANTS.WORLD.WORLD_SIZE / 2;
        this.ctx.strokeStyle = CONSTANTS.WORLD.BORDER_COLOR;
        this.ctx.lineWidth = CONSTANTS.WORLD.BORDER_WIDTH;
        this.ctx.strokeRect(
            -halfSize - this.player.x + this.centerX,
            -halfSize - this.player.y + this.centerY,
            CONSTANTS.WORLD.WORLD_SIZE,
            CONSTANTS.WORLD.WORLD_SIZE
        );

        // Stars (Tiled and Pre-rendered)
        const tileSize = CONSTANTS.WORLD.STAR_TILE_SIZE;
        const worldSize = CONSTANTS.WORLD.WORLD_SIZE;
        this.starTiles.forEach(tile => {
            // Calculate tiled position relative to player with wrapping
            let sx = (tile.x - this.player.x + this.centerX) % worldSize;
            let sy = (tile.y - this.player.y + this.centerY) % worldSize;
            
            // Adjust for negative modulo to keep tiles continuous
            if (sx < -tileSize) sx += worldSize;
            if (sx > vSize) sx -= worldSize;
            if (sy < -tileSize) sy += worldSize;
            if (sy > vSize) sy -= worldSize;

            // Only draw if tile is partially visible
            if (sx < vSize && sx + tileSize > 0 && sy < vSize && sy + tileSize > 0) {
                this.ctx.drawImage(tile.canvas, sx, sy);
            }
        });

        // Render Obstacles
        const obsSize = CONSTANTS.WORLD.OBSTACLE_SIZE;
        const halfObs = obsSize / 2;
        this.ctx.strokeStyle = CONSTANTS.WORLD.OBSTACLE_COLOR;
        this.ctx.lineWidth = CONSTANTS.WORLD.OBSTACLE_LINE_WIDTH;
        CONSTANTS.WORLD.OBSTACLES.forEach(obs => {
            const screenX = obs.x - this.player.x + this.centerX;
            const screenY = obs.y - this.player.y + this.centerY;
            
            if (screenX > -obsSize && screenX < vSize + obsSize &&
                screenY > -obsSize && screenY < vSize + obsSize) {
                
                this.ctx.strokeRect(screenX - halfObs, screenY - halfObs, obsSize, obsSize);
                
                // Criss-cross lines
                this.ctx.beginPath();
                this.ctx.moveTo(screenX - halfObs, screenY - halfObs);
                this.ctx.lineTo(screenX + halfObs, screenY + halfObs);
                this.ctx.moveTo(screenX + halfObs, screenY - halfObs);
                this.ctx.lineTo(screenX - halfObs, screenY + halfObs);
                this.ctx.stroke();
            }
        });

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
        
        // Render Orbitals
        if (this.player.numOrbitals > 0) {
            const orbitRadius = this.player.range * CONSTANTS.ORBITAL.RANGE_FACTOR;
            const orbitalSprite = this.sprites.get('orbital');
            const padding = CONSTANTS.WORLD.SPRITE_PADDING;
            
            for (let i = 0; i < this.player.numOrbitals; i++) {
                const angle = this.orbitalAngle + (i * (Math.PI * 2) / this.player.numOrbitals);
                const ox = Math.cos(angle) * orbitRadius + this.centerX;
                const oy = Math.sin(angle) * orbitRadius + this.centerY;
                
                this.ctx.drawImage(orbitalSprite, ox - CONSTANTS.ORBITAL.SIZE / 2 - padding, oy - CONSTANTS.ORBITAL.SIZE / 2 - padding);
            }
        }
        
        // Optimized Enemy/Box Rendering using Spatial Grid
        const halfV = CONSTANTS.WORLD.VIEWPORT_SIZE / 2 + 50; // Viewport half-size + margin
        const visibleEntities = this.grid.getInRegion(
            this.player.x - halfV, 
            this.player.y - halfV, 
            this.player.x + halfV, 
            this.player.y + halfV
        );
        
        visibleEntities.forEach(e => {
            let sprite;
            if (e.type === 'boss') sprite = this.sprites.get('boss');
            else if (e instanceof Box) sprite = this.sprites.get('box');
            else sprite = this.sprites.get('enemy');
            
            e.draw(this.ctx, this.player.x, this.player.y, this.centerX, this.centerY, sprite);
        });
        
        // Render Dots
        this.magnetDots.forEach(dot => {
            if (isVisible(dot)) dot.draw(this.ctx, this.player.x, this.player.y, this.centerX, this.centerY, this.sprites.get('magnet'));
        });
        this.goldDots.forEach(dot => {
            if (isVisible(dot)) dot.draw(this.ctx, this.player.x, this.player.y, this.centerX, this.centerY, this.sprites.get('gold'));
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
