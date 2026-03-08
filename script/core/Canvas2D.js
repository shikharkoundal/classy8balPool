export default class Canvas2D {
  static canvas = null;
  static ctx = null;

  static canvas;
  static ctx;

  static width = 1000;
  static height = 600;

  static init(id, width, height) {
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext("2d");

    this.width = width;
    this.height = height;

    this.canvas.width = width;
    this.canvas.height = height;

    this.resize();

    window.addEventListener("resize", () => this.resize());
  }

  static resize() {
    const scale = Math.min(
      window.innerWidth / this.width,
      window.innerHeight / this.height,
    );

    this.canvas.style.width = this.width * scale + "px";
    this.canvas.style.height = this.height * scale + "px";
  }
  
  static clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  static drawCircle(x, y, radius, color) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }
}
