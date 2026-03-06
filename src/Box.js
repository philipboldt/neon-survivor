import { CONSTANTS } from './constants.js';

export class Box {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONSTANTS.BOX.SIZE;
        this.health = CONSTANTS.BOX.HEALTH;
        this.color = CONSTANTS.BOX.COLOR;
        this.glow = CONSTANTS.BOX.GLOW;
    }

    draw(ctx, playerX, playerY, centerX, centerY, sprite) {
        const screenX = this.x - playerX + centerX;
        const screenY = this.y - playerY + centerY;
        
        if (sprite) {
            const padding = CONSTANTS.WORLD.SPRITE_PADDING;
            ctx.drawImage(sprite, screenX - this.size/2 - padding, screenY - this.size/2 - padding);
        } else {
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.glow;
            ctx.strokeRect(screenX - this.size/2, screenY - this.size/2, this.size, this.size);
            ctx.restore();
        }
    }
}
