import { CONSTANTS } from './constants.js';

export class Enemy {
    constructor(playerX, playerY, width, height, type = 'normal') {
        this.type = type;
        const isBoss = type === 'boss';
        
        // Spawn outside the visible area but within world bounds
        const margin = CONSTANTS.ENEMY.SPAWN_MARGIN;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        
        const halfSize = CONSTANTS.WORLD.WORLD_SIZE / 2;
        const entitySize = isBoss ? CONSTANTS.MINI_BOSS.SIZE : CONSTANTS.ENEMY.SIZE;
        
        let spawnX, spawnY;
        let validSpawn = false;
        let attempts = 0;

        while (!validSpawn && attempts < 10) {
            const side = Math.floor(Math.random() * 4);
            if (side === 0) { // Top
                spawnX = playerX + (Math.random() - 0.5) * (width + margin * 2);
                spawnY = playerY - halfHeight - margin;
            } else if (side === 1) { // Right
                spawnX = playerX + halfWidth + margin;
                spawnY = playerY + (Math.random() - 0.5) * (height + margin * 2);
            } else if (side === 2) { // Bottom
                spawnX = playerX + (Math.random() - 0.5) * (width + margin * 2);
                spawnY = playerY + halfHeight + margin;
            } else { // Left
                spawnX = playerX - halfWidth - margin;
                spawnY = playerY + (Math.random() - 0.5) * (height + margin * 2);
            }

            // Clamp and check if it's actually outside visible area after clamping
            spawnX = Math.max(-halfSize + entitySize, Math.min(halfSize - entitySize, spawnX));
            spawnY = Math.max(-halfSize + entitySize, Math.min(halfSize - entitySize, spawnY));

            const isVisible = (
                spawnX > playerX - halfWidth && 
                spawnX < playerX + halfWidth && 
                spawnY > playerY - halfHeight && 
                spawnY < playerY + halfHeight
            );

            // Obstacle check
            let inObstacle = false;
            const obsHalfSize = CONSTANTS.WORLD.OBSTACLE_SIZE / 2;
            for (const obs of CONSTANTS.WORLD.OBSTACLES) {
                if (spawnX > obs.x - obsHalfSize - entitySize && 
                    spawnX < obs.x + obsHalfSize + entitySize && 
                    spawnY > obs.y - obsHalfSize - entitySize && 
                    spawnY < obs.y + obsHalfSize + entitySize) {
                    inObstacle = true;
                    break;
                }
            }

            if (!isVisible && !inObstacle) {
                validSpawn = true;
            }
            attempts++;
        }

        this.x = spawnX;
        this.y = spawnY;

        this.size = entitySize;
        this.health = isBoss ? CONSTANTS.MINI_BOSS.HEALTH : 1;
        this.damage = isBoss ? CONSTANTS.MINI_BOSS.DAMAGE : CONSTANTS.ENEMY.DAMAGE;
        this.color = isBoss ? CONSTANTS.MINI_BOSS.COLOR : CONSTANTS.ENEMY.COLOR;
        this.glow = this.color;
    }

    draw(ctx, playerX, playerY, centerX, centerY, sprite) {
        // Render relative to player's center view
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
