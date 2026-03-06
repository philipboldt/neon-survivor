import { CONSTANTS } from './constants.js';

export class Enemy {
    constructor(playerX, playerY, width, height) {
        // Spawn randomly relative to the player
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(width, height) / 2 + 100;
        let spawnX = playerX + Math.cos(angle) * distance;
        let spawnY = playerY + Math.sin(angle) * distance;

        // Clamp to world boundaries
        const halfSize = CONSTANTS.WORLD.WORLD_SIZE / 2;
        this.x = Math.max(-halfSize + CONSTANTS.ENEMY.SIZE, Math.min(halfSize - CONSTANTS.ENEMY.SIZE, spawnX));
        this.y = Math.max(-halfSize + CONSTANTS.ENEMY.SIZE, Math.min(halfSize - CONSTANTS.ENEMY.SIZE, spawnY));

        this.size = CONSTANTS.ENEMY.SIZE;
        this.health = 1;
        this.color = CONSTANTS.ENEMY.COLOR;
        this.glow = CONSTANTS.ENEMY.COLOR;
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
