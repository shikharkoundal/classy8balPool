// script/menu/Label.js
import Canvas2D from "../Canvas2D.js";

export default class Label {
    constructor(text, position, origin, color, align, fontName, fontSize) {
        this.text = text;
        this.position = position;
        this.origin = origin;
        this.color = color;
        this.align = align;
        this.fontName = fontName;
        this.fontSize = fontSize;
    }

    draw() {
        Canvas2D.drawText(
            this.text,
            this.position,
            this.origin,
            this.color,
            this.align,
            this.fontName,
            this.fontSize
        );
    }
}
