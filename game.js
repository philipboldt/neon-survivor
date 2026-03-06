/**
 * Neon Survivor - Functional Prototype
 * Fullscreen, Vector Math, Acceleration, Neon Aesthetics
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timeDisplay = document.getElementById('time');

let width, height, centerX, centerY;
let enemies = [];
let startTime = Date.now();
let lastSpawnTime = 0;
const spawnInterval = 500; // ms

// Constants for Movement & Acceleration
const MAX_SPEED = 3;
const MIN_SPEED = 0.5;
const MAX_ACCEL_DIST = 500;
const PLAYER_RADIUS = 20;

// Player World Position
let playerX = 0;
let playerY = 0;
const PLAYER_SPEED = 5;

// Input Handling
const keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

class Enemy {
    constructor() {
        // Spawn randomly relative to the player
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(width, height) / 2 + 100;
        this.x = playerX + Math.cos(angle) * distance;
        this.y = playerY + Math.sin(angle) * distance;

        this.size = 15;
        this.color = '#ff003c'; // Neon Red
        this.glow = '#ff003c';
        this.stopped = false;
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

    spawnEnemy();
    
    // 1. Basic Movement (towards the player)
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

    // 2. Collision Resolution (Enemies vs Enemies)
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

    // 3. Collision Resolution (Enemies vs Player)
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

    // Grid for visual reference of movement
    const gridSize = 50;
    const startX = centerX - (playerX % gridSize);
    const startY = centerY - (playerY % gridSize);
    
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX - gridSize; x < width + gridSize; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = startY - gridSize; y < height + gridSize; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();

    drawPlayer();
    enemies.forEach(enemy => enemy.draw());
};

const loop = () => {
    update();
    render();
    requestAnimationFrame(loop);
};

window.addEventListener('resize', resize);
resize();
loop();
