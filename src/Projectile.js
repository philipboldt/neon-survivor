import { CONSTANTS } from './constants.js';

export class Projectile {
    constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;
        
        const dx = targetX - startX;
        const dy = targetY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        this.speed = CONSTANTS.PROJECTILE.SPEED;
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
        
        this.size = CONSTANTS.PROJECTILE.SIZE;
        this.color = CONSTANTS.PROJECTILE.COLOR;
        this.life = CONSTANTS.PROJECTILE.LIFE;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
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
