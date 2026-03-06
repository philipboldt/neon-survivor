/**
 * Neon Survivor - Functional Prototype
 * Fullscreen, Vector Math, Acceleration, Neon Aesthetics
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timeDisplay = document.getElementById('time');

let width, height, centerX, centerY;
let enemies = [];
let projectiles = [];
let startTime = Date.now();
let lastSpawnTime = 0;
const spawnInterval = 500; // ms

// Constants for Movement & Acceleration
const MAX_SPEED = 2.2;
const MIN_SPEED = 0.4;
const MAX_ACCEL_DIST = 500;
const PLAYER_RADIUS = 20;

// Player Stats & Weapon
let playerX = 0;
let playerY = 0;
const PLAYER_SPEED = 5;
const PLAYER_RANGE = 250;
const WEAPON_COOLDOWN = 1000; // 1 second
let lastAttackTime = 0;

// Starfield (Background dots)
const stars = [];
const STAR_COUNT = 200;
const WORLD_SIZE = 2000; // Size of the area stars are distributed in

for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
        x: (Math.random() - 0.5) * WORLD_SIZE,
        y: (Math.random() - 0.5) * WORLD_SIZE,
        size: Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.5
    });
}

// Input Handling
const keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

class Projectile {
    constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;
        
        const dx = targetX - startX;
        const dy = targetY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        this.speed = 7;
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
        
        this.size = 4;
        this.color = '#00d2ff';
        this.life = 100; // Frames or distance
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw() {
        ctx.save();
        const screenX = this.x - playerX + centerX;
        const screenY = this.y - playerY + centerY;
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Enemy {
    constructor() {
        // Spawn randomly relative to the player
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(width, height) / 2 + 100;
        this.x = playerX + Math.cos(angle) * distance;
        this.y = playerY + Math.sin(angle) * distance;

        this.size = 15;
        this.health = 1;
        this.color = '#ff003c'; // Neon Red
        this.glow = '#ff003c';
    }

    draw() {
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.glow;
        
        // Render relative to player's center view
        const screenX = this.x - playerX + centerX;
        const screenY = this.y - playerY + centerY;
        
        ctx.strokeRect(screenX - this.size/2, screenY - this.size/2, this.size, this.size);
        ctx.restore();
    }
}

const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
};

const drawPlayer = () => {
    // Range Indicator
    ctx.save();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, PLAYER_RANGE, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Player
    ctx.save();
    ctx.strokeStyle = '#00d2ff'; // Neon Blue
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00d2ff';
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
};

const spawnEnemy = () => {
    const now = Date.now();
    if (now - lastSpawnTime > spawnInterval) {
        enemies.push(new Enemy());
        lastSpawnTime = now;
    }
};

const update = () => {
    // Player movement
    if (keys['KeyW'] || keys['ArrowUp']) playerY -= PLAYER_SPEED;
    if (keys['KeyS'] || keys['ArrowDown']) playerY += PLAYER_SPEED;
    if (keys['KeyA'] || keys['ArrowLeft']) playerX -= PLAYER_SPEED;
    if (keys['KeyD'] || keys['ArrowRight']) playerX += PLAYER_SPEED;

    // Automatic Attack
    const now = Date.now();
    if (now - lastAttackTime > WEAPON_COOLDOWN) {
        // Find nearest enemy in range
        let nearestEnemy = null;
        let minDist = PLAYER_RANGE;

        enemies.forEach(enemy => {
            const dx = enemy.x - playerX;
            const dy = enemy.y - playerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {
            projectiles.push(new Projectile(playerX, playerY, nearestEnemy.x, nearestEnemy.y));
            lastAttackTime = now;
        }
    }

    spawnEnemy();
    
    // 1. Projectiles Update
    projectiles.forEach((p, index) => {
        p.update();
        if (p.life <= 0) {
            projectiles.splice(index, 1);
            return;
        }

        // Projectile vs Enemy Collision
        enemies.forEach((enemy, eIndex) => {
            const dx = p.x - enemy.x;
            const dy = p.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < enemy.size / 2 + p.size) {
                enemy.health -= 1;
                p.life = 0; // Destroy projectile
            }
        });
    });

    // 2. Enemy death
    enemies = enemies.filter(enemy => enemy.health > 0);

    // 3. Enemy Movement (towards the player)
    enemies.forEach(enemy => {
        const dx = playerX - enemy.x;
        const dy = playerY - enemy.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

        let speed = MIN_SPEED + (1 - Math.min(distanceToPlayer, MAX_ACCEL_DIST) / MAX_ACCEL_DIST) * (MAX_SPEED - MIN_SPEED);
        
        if (distanceToPlayer > 0) {
            enemy.x += (dx / distanceToPlayer) * speed;
            enemy.y += (dy / distanceToPlayer) * speed;
        }
    });

    // 4. Collision Resolution (Enemies vs Enemies)
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < enemies.length; j++) {
            for (let k = j + 1; k < enemies.length; k++) {
                const e1 = enemies[j];
                const e2 = enemies[k];
                const dx = e1.x - e2.x;
                const dy = e1.y - e2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = e1.size;

                if (dist < minDist && dist > 0) {
                    const overlap = (minDist - dist) / 2;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    e1.x += nx * overlap;
                    e1.y += ny * overlap;
                    e2.x -= nx * overlap;
                    e2.y -= ny * overlap;
                }
            }
        }
    }

    // 5. Collision Resolution (Enemies vs Player)
    enemies.forEach(enemy => {
        const dx = enemy.x - playerX;
        const dy = enemy.y - playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = PLAYER_RADIUS + enemy.size / 2;

        if (dist < minDist && dist > 0) {
            enemy.x = playerX + (dx / dist) * minDist;
            enemy.y = playerY + (dy / dist) * minDist;
        }
    });

    timeDisplay.innerText = Math.floor((Date.now() - startTime) / 1000);
};

const render = () => {
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Render Stars
    ctx.fillStyle = '#666';
    stars.forEach(star => {
        let sx = (star.x - playerX + centerX) % WORLD_SIZE;
        let sy = (star.y - playerY + centerY) % WORLD_SIZE;
        if (sx < 0) sx += WORLD_SIZE;
        if (sy < 0) sy += WORLD_SIZE;
        if (sx < width && sy < height) {
            ctx.globalAlpha = star.opacity;
            ctx.beginPath();
            ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.globalAlpha = 1.0;

    drawPlayer();
    enemies.forEach(enemy => enemy.draw());
    projectiles.forEach(p => p.draw());
};

const loop = () => {
    update();
    render();
    requestAnimationFrame(loop);
};

window.addEventListener('resize', resize);
resize();
loop();
