import { CONSTANTS } from './constants.js';
import { ExperienceDot } from './ExperienceDot.js';

export class GoldDot extends ExperienceDot {
    constructor(x, y) {
        super(x, y, 0);
        this.size = CONSTANTS.GOLD.SIZE;
        this.color = CONSTANTS.GOLD.COLOR;
        this.glow = CONSTANTS.GOLD.GLOW;
    }
}
