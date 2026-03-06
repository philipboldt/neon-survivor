export class SpriteManager {
    constructor() {
        this.sprites = new Map();
    }

    /**
     * Pre-renders a drawing to an offscreen canvas.
     */
    preRender(key, width, height, drawFn) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        drawFn(ctx, width / 2, height / 2);
        
        this.sprites.set(key, canvas);
        return canvas;
    }

    get(key) {
        return this.sprites.get(key);
    }
}
