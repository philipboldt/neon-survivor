import { CONSTANTS } from './constants.js';

export class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = CONSTANTS.PLAYER.RADIUS;
        this.speed = CONSTANTS.PLAYER.SPEED;
        this.range = CONSTANTS.PLAYER.RANGE;
        this.color = CONSTANTS.PLAYER.COLOR;
        this.cooldown = CONSTANTS.PLAYER.WEAPON_COOLDOWN;
    }

    update(keys) {
        if (keys['KeyW'] || keys['ArrowUp']) this.y -= this.speed;
        if (keys['KeyS'] || keys['ArrowDown']) this.y += this.speed;
        if (keys['KeyA'] || keys['ArrowLeft']) this.x -= this.speed;
        if (keys['KeyD'] || keys['ArrowRight']) this.x += this.speed;
    }

    draw(ctx, centerX, centerY) {
        // Range Indicator
        ctx.save();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Player Circle
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
