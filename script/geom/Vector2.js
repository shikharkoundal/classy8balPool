export default class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  clone() { return new Vector2(this.x, this.y); }
  copyFrom(v) { this.x = v.x; this.y = v.y; return this; }
  add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
  multiply(s) { return new Vector2(this.x * s, this.y * s); }
  multiplyWith(s) { this.x *= s; this.y *= s; return this; } // in-place
  distanceFrom(v) {
    const dx = this.x - v.x, dy = this.y - v.y;
    return Math.sqrt(dx*dx + dy*dy);
  }
  static get zero() { return new Vector2(0,0); }
}
