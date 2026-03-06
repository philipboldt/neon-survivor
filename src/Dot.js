import { CONSTANTS } from './constants.js';

export class Dot {
    constructor(x, y, type = 'exp', value = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.value = value;
        this.isFollowing = false;
        this.dead = false;
        this.createdAt = Date.now();

        // Configure based on type
        switch (type) {
            case 'heal':
                this.size = CONSTANTS.HEAL.SIZE;
                this.color = CONSTANTS.HEAL.COLOR;
                this.lifespan = CONSTANTS.HEAL.LIFESPAN;
                break;
            case 'magnet':
                this.size = CONSTANTS.MAGNET.SIZE;
                this.color = CONSTANTS.MAGNET.COLOR;
                this.lifespan = Infinity;
                break;
            case 'gold':
                this.size = CONSTANTS.GOLD.SIZE;
                this.color = CONSTANTS.GOLD.COLOR;
                this.lifespan = Infinity;
                break;
            case 'exp':
            default:
                this.size = CONSTANTS.EXPERIENCE.SIZE;
                this.color = CONSTANTS.EXPERIENCE.COLOR;
                this.lifespan = Infinity;
                break;
        }

        this.speed = CONSTANTS.PLAYER.SPEED * CONSTANTS.EXPERIENCE.SPEED_MULTIPLIER;
    }

    update(playerX, playerY) {
        // Lifespan check
        if (this.lifespan !== Infinity && Date.now() - this.createdAt > this.lifespan) {
            this.dead = true;
            return;
        }

        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distSq = dx * dx + dy * dy;

        // Collection range check
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
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
