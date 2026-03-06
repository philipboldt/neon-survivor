import { CONSTANTS } from './constants.js';
import { ExperienceDot } from './ExperienceDot.js';

export class MagnetDot extends ExperienceDot {
    constructor(x, y) {
        super(x, y, 0);
        this.size = CONSTANTS.MAGNET.SIZE;
        this.color = CONSTANTS.MAGNET.COLOR;
        this.glow = CONSTANTS.MAGNET.GLOW;
    }
}
