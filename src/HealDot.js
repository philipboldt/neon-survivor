import { CONSTANTS } from './constants.js';

export class HealDot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONSTANTS.HEAL.SIZE;
        this.color = CONSTANTS.HEAL.COLOR;
        this.speed = CONSTANTS.PLAYER.SPEED * CONSTANTS.EXPERIENCE.SPEED_MULTIPLIER;
        this.isFollowing = false;
    }

    update(playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < CONSTANTS.PLAYER.COLLECT_RANGE * CONSTANTS.PLAYER.COLLECT_RANGE) {
            this.isFollowing = true;
        }

        if (this.isFollowing) {
            const dist = Math.sqrt(distSq);
            if (dist > 0) {
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;
            }
        }
    }

    draw(ctx, playerX, playerY, centerX, centerY, sprite) {
        const screenX = this.x - playerX + centerX;
        const screenY = this.y - playerY + centerY;
        
        if (sprite) {
            const padding = CONSTANTS.WORLD.SPRITE_PADDING;
            ctx.drawImage(sprite, screenX - this.size - padding, screenY - this.size - padding);
        } else {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
