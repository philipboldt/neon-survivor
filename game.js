import { CONFIG } from './src/config.js';
import { Player } from './src/Player.js';
import { Enemy } from './src/Enemy.js';
import { Projectile } from './src/Projectile.js';

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.timeDisplay = document.getElementById('time');

        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;

        this.player = new Player();
        this.enemies = [];
        this.projectiles = [];
        this.stars = [];
        
        this.startTime = Date.now();
        this.lastSpawnTime = 0;
        this.lastAttackTime = 0;
        this.keys = {};

        this.init();
    }

    init() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        this.generateStars();
        this.resize();
        this.loop();
    }

    generateStars() {
        const { STAR_COUNT, WORLD_SIZE } = CONFIG.WORLD;
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
        if (now - this.lastSpawnTime > CONFIG.ENEMY.SPAWN_INTERVAL) {
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
                }
            });
        });

        this.enemies = this.enemies.filter(enemy => enemy.health > 0);

        // Enemy AI & Collisions
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const speed = CONFIG.ENEMY.MIN_SPEED + (1 - Math.min(dist, CONFIG.ENEMY.MAX_ACCEL_DIST) / CONFIG.ENEMY.MAX_ACCEL_DIST) * (CONFIG.ENEMY.MAX_SPEED - CONFIG.ENEMY.MIN_SPEED);
            
            if (dist > 0) {
                enemy.x += (dx / dist) * speed;
                enemy.y += (dy / dist) * speed;
            }

            // Enemy vs Player collision
            const pDist = Math.sqrt((enemy.x - this.player.x)**2 + (enemy.y - this.player.y)**2);
            const minPDist = this.player.radius + enemy.size / 2;
            if (pDist < minPDist && pDist > 0) {
                enemy.x = this.player.x + ((enemy.x - this.player.x) / pDist) * minPDist;
                enemy.y = this.player.y + ((enemy.y - this.player.y) / pDist) * minPDist;
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

        this.timeDisplay.innerText = Math.floor((Date.now() - this.startTime) / 1000);
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        this.ctx.fillStyle = CONFIG.WORLD.STAR_COLOR;
        this.stars.forEach(star => {
            let sx = (star.x - this.player.x + this.centerX) % CONFIG.WORLD.WORLD_SIZE;
            let sy = (star.y - this.player.y + this.centerY) % CONFIG.WORLD.WORLD_SIZE;
            if (sx < 0) sx += CONFIG.WORLD.WORLD_SIZE;
            if (sy < 0) sy += CONFIG.WORLD.WORLD_SIZE;
            if (sx < this.width && sy < this.height) {
                this.ctx.globalAlpha = star.opacity;
                this.ctx.beginPath();
                this.ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        this.ctx.globalAlpha = 1.0;

        this.player.draw(this.ctx, this.centerX, this.centerY);
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
