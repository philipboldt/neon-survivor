import { CONFIG } from './config.js';

export class Enemy {
    constructor(playerX, playerY, width, height) {
        // Spawn randomly relative to the player
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(width, height) / 2 + 100;
        this.x = playerX + Math.cos(angle) * distance;
        this.y = playerY + Math.sin(angle) * distance;

        this.size = CONFIG.ENEMY.SIZE;
        this.health = 1;
        this.color = CONFIG.ENEMY.COLOR;
        this.glow = CONFIG.ENEMY.COLOR;
    }

    draw(ctx, playerX, playerY, centerX, centerY) {
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
