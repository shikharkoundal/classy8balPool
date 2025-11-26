import Vector2 from "../geom/Vector2.js";
import Canvas2D from "../Canvas2D.js";

export default class Score {
  constructor(position) {
    this.position = position;
    this.origin = new Vector2(47,82);
    this.value = 0;
  }

  reset() {
    this.value = 0;
  }

  draw() {
    Canvas2D.drawText(this.value, this.position, this.origin, "#096834", "left", "Impact", "200px");
  }

  drawLines(color) {
    for (let i=0;i<this.value;i++){
      const pos = this.position.add(new Vector2(i*15,0));
      Canvas2D.drawText("I", pos, this.origin, color, "left", "Arial", "20px");
    }
  }

  increment() { this.value++; }
}
