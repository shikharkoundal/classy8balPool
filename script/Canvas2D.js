// script/Canvas2D.js
export default class Canvas2D {
    static canvas = null;
    static _ctx = null;   // <--- IMPORTANT: your whole project expects _ctx !!!

    static initialize(divId, canvasId) {
        this.canvas = document.getElementById(canvasId);

        if (!this.canvas) {
            console.error("Canvas not found:", canvasId);
            return;
        }

        this._ctx = this.canvas.getContext("2d");
    }

    static setGameSize(size) {
        if (!this.canvas) return;
        this.canvas.width  = size.x;
        this.canvas.height = size.y;
    }

    static clear() {
        if (!this._ctx) return;
        this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    static drawImage(img, pos, rotation = 0, scale = 1, origin = {x:0, y:0}) {
        if (!this._ctx) return;

        this._ctx.save();
        this._ctx.translate(pos.x, pos.y);
        this._ctx.rotate(rotation);
        this._ctx.scale(scale, scale);
        this._ctx.drawImage(img, -origin.x, -origin.y);
        this._ctx.restore();
    }
}
