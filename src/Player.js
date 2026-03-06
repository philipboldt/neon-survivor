import { CONSTANTS } from './constants.js';

export class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = CONSTANTS.PLAYER.RADIUS;
        this.speed = CONSTANTS.PLAYER.SPEED;
        this.range = CONSTANTS.PLAYER.RANGE;
        this.collectRange = CONSTANTS.PLAYER.COLLECT_RANGE;
        this.color = CONSTANTS.PLAYER.COLOR;
        this.cooldown = CONSTANTS.PLAYER.WEAPON_COOLDOWN;
        this.health = CONSTANTS.PLAYER.MAX_HEALTH;
        this.maxHealth = CONSTANTS.PLAYER.MAX_HEALTH;

        this.experience = 0;
        this.experienceToNextLevel = CONSTANTS.PLAYER.INITIAL_EXP;
        this.level = 1;

        this.numProjectiles = 1;
        this.projectileDamage = 1;
        this.numOrbitals = 0;
        this.gold = 0;
    }

    update(keys) {
        if (keys['KeyW'] || keys['ArrowUp']) this.y -= this.speed;
        if (keys['KeyS'] || keys['ArrowDown']) this.y += this.speed;
        if (keys['KeyA'] || keys['ArrowLeft']) this.x -= this.speed;
        if (keys['KeyD'] || keys['ArrowRight']) this.x += this.speed;

        // Clamp to world boundaries
        const halfSize = CONSTANTS.WORLD.WORLD_SIZE / 2;
        this.x = Math.max(-halfSize + this.radius, Math.min(halfSize - this.radius, this.x));
        this.y = Math.max(-halfSize + this.radius, Math.min(halfSize - this.radius, this.y));
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    healFull() {
        this.health = this.maxHealth;
    }

    gainExperience(amount) {
        this.experience += amount;
        if (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
            return true; // Leveled up
        }
        return false;
    }

    levelUp() {
        this.experience -= this.experienceToNextLevel;
        this.level++;
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * CONSTANTS.PLAYER.EXP_MULTIPLIER);
    }

    draw(ctx, centerX, centerY, width, height, sprite) {
        this.drawHealthBar(ctx, width);
        this.drawExpBar(ctx, width, height);

        // Weapon Range Indicator (grey)
        ctx.save();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Collect Range Indicator (dark blue)
        ctx.save();
        ctx.strokeStyle = '#003366';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.collectRange, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Player Circle
        if (sprite) {
            const padding = CONSTANTS.WORLD.SPRITE_PADDING;
            ctx.drawImage(sprite, centerX - this.radius - padding, centerY - this.radius - padding);
        } else {
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawHealthBar(ctx, screenWidth) {
        const { WIDTH, HEIGHT, COLOR, BG_COLOR } = CONSTANTS.PLAYER.HEALTH_BAR;
        const x = (screenWidth - WIDTH) / 2;
        const y = 20;

        // Background
        ctx.save();
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(x, y, WIDTH, HEIGHT);

        // Filled part
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = COLOR;
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLOR;
        ctx.fillRect(x, y, WIDTH * healthPercent, HEIGHT);
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, WIDTH, HEIGHT);
        ctx.restore();
    }

    drawExpBar(ctx, screenWidth, screenHeight) {
        const { WIDTH, HEIGHT, COLOR, BG_COLOR } = CONSTANTS.PLAYER.EXP_BAR;
        const x = (screenWidth - WIDTH) / 2;
        const y = screenHeight - 40;

        // Background
        ctx.save();
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(x, y, WIDTH, HEIGHT);

        // Filled part
        const expPercent = this.experience / this.experienceToNextLevel;
        ctx.fillStyle = COLOR;
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLOR;
        ctx.fillRect(x, y, WIDTH * expPercent, HEIGHT);
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, WIDTH, HEIGHT);

        // Level Text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(`LVL ${this.level}`, screenWidth / 2, y - 5);
        ctx.restore();
    }
}
