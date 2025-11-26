// script/menu/Menu.js
import Canvas2D from "../Canvas2D.js";

export default class Menu {
    constructor(game) {
        this.game = game;
        this.labels = [];
        this.buttons = [];
        this.visible = false;
    }

    build(labels, buttons) {
        this.labels = labels;
        this.buttons = buttons;
        this.visible = true;
    }

    update() {}

    draw() {
        if (!this.visible) return;

        // Draw labels
        for (const l of this.labels) l.draw();

        // Draw buttons
        for (const b of this.buttons) b.draw();
    }

    handleInput() {
        if (!this.visible) return;
        for (const b of this.buttons) b.handleInput();
    }
}
