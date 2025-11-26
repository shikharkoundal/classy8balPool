// script/menu/Button.js
import Canvas2D from "../Canvas2D.js";
import Mouse from "../input/Mouse.js";

export default class Button {
    constructor(sprite, hoverSprite, position, callback) {
        this.sprite = sprite;
        this.hoverSprite = hoverSprite;
        this.position = position;
        this.callback = callback;

        this.width = sprite.width;
        this.height = sprite.height;
    }

    isHovered() {
        return (
            Mouse.position.x >= this.position.x &&
            Mouse.position.x <= this.position.x + this.width &&
            Mouse.position.y >= this.position.y &&
            Mouse.position.y <= this.position.y + this.height
        );
    }

    draw() {
        const ctx = Canvas2D._ctx;
        if (!ctx) return;

        const img = this.isHovered() ? this.hoverSprite : this.sprite;
        if (!img) return;

        Canvas2D.drawImage(img, this.position);
    }

    handleInput() {
        if (Mouse.left.pressed && this.isHovered()) {
            this.callback();
        }
    }
}
