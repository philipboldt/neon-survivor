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
        return this.getInRegion(x - this.cellSize, y - this.cellSize, x + this.cellSize, y + this.cellSize);
    }

    /**
     * Get all entities within a rectangular region.
     */
    getInRegion(x1, y1, x2, y2) {
        const gx1 = Math.floor((x1 + this.halfSize) / this.cellSize);
        const gy1 = Math.floor((y1 + this.halfSize) / this.cellSize);
        const gx2 = Math.floor((x2 + this.halfSize) / this.cellSize);
        const gy2 = Math.floor((y2 + this.halfSize) / this.cellSize);

        const entities = [];
        for (let gx = gx1; gx <= gx2; gx++) {
            for (let gy = gy1; gy <= gy2; gy++) {
                const cell = this.cells.get(`${gx},${gy}`);
                if (cell) {
                    entities.push(...cell);
                }
            }
        }
        return entities;
    }
}
