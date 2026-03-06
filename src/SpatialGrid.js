import { CONSTANTS } from './constants.js';

/**
 * A simple 2D spatial grid for optimization.
 */
export class SpatialGrid {
    constructor(worldSize, cellSize = CONSTANTS.WORLD.GRID_CELL_SIZE) {
        this.cellSize = cellSize;
        this.worldSize = worldSize;
        this.halfSize = worldSize / 2;
        this.cols = Math.ceil(worldSize / cellSize);
        this.cells = new Map();
    }

    clear() {
        this.cells.clear();
    }

    /**
     * Convert world coordinates to cell index.
     */
    _getKey(x, y) {
        // Offset coordinates to be positive (from 0 to worldSize)
        const ox = x + this.halfSize;
        const oy = y + this.halfSize;
        const gx = Math.floor(ox / this.cellSize);
        const gy = Math.floor(oy / this.cellSize);
        return `${gx},${gy}`;
    }

    insert(entity) {
        const key = this._getKey(entity.x, entity.y);
        if (!this.cells.has(key)) {
            this.cells.set(key, []);
        }
        this.cells.get(key).push(entity);
    }

    getNearby(x, y) {
        const ox = x + this.halfSize;
        const oy = y + this.halfSize;
        const gx = Math.floor(ox / this.cellSize);
        const gy = Math.floor(oy / this.cellSize);
        
        const nearby = [];
        for (let ix = -1; ix <= 1; ix++) {
            for (let iy = -1; iy <= 1; iy++) {
                const key = `${gx + ix},${gy + iy}`;
                const cell = this.cells.get(key);
                if (cell) {
                    nearby.push(...cell);
                }
            }
        }
        return nearby;
    }
}
