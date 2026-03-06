import { CONSTANTS } from './constants.js';

export class Projectile {
    constructor(startX, startY, targetX, targetY, maxRange) {
        this.x = startX;
        this.y = startY;
        this.startX = startX;
        this.startY = startY;
        
        const dx = targetX - startX;
        const dy = targetY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        this.speed = CONSTANTS.PROJECTILE.SPEED;
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
        
        this.size = CONSTANTS.PROJECTILE.SIZE;
        this.color = CONSTANTS.PROJECTILE.COLOR;
        this.maxRange = maxRange;
        this.distanceTraveled = 0;
        this.life = CONSTANTS.PROJECTILE.LIFE;
        this.dead = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        const dx = this.x - this.startX;
        const dy = this.y - this.startY;
        this.distanceTraveled = Math.sqrt(dx * dx + dy * dy);
        
        if (this.distanceTraveled > this.maxRange) {
            this.dead = true;
        }
        
        this.life--;
        if (this.life <= 0) this.dead = true;
    }

    draw(ctx, playerX, playerY, centerX, centerY) {
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
