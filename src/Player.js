import { CONFIG } from './config.js';

export class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = CONFIG.PLAYER.RADIUS;
        this.speed = CONFIG.PLAYER.SPEED;
        this.range = CONFIG.PLAYER.RANGE;
        this.color = CONFIG.PLAYER.COLOR;
        this.cooldown = CONFIG.PLAYER.WEAPON_COOLDOWN;
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
