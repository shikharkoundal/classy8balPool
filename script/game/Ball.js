export default class Ball {
  constructor(x, y, radius, color, sprite) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.sprite = sprite;
    this.vx = 0;
    this.vy = 0;

    this.rotation = 0;
    this.angularVelocity = 0;
  }

  update(dt, table) {
    const frictionPerSecond = 0.4; // 0.3–0.6 good range

    this.vx -= this.vx * frictionPerSecond * dt;
    this.vy -= this.vy * frictionPerSecond * dt;

    // stop threshold
    if (Math.abs(this.vx) < 5) this.vx = 0;
    if (Math.abs(this.vy) < 5) this.vy = 0;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // LEFT / RIGHT WALL
    if (this.x - this.radius < table.left) {
      this.x = table.left + this.radius;
      this.vx *= -1;
    }

    if (this.x + this.radius > table.right) {
      this.x = table.right - this.radius;
      this.vx *= -1;
    }

    // TOP / BOTTOM WALL
    if (this.y - this.radius < table.top) {
      this.y = table.top + this.radius;
      this.vy *= -1;
    }

    if (this.y + this.radius > table.bottom) {
      this.y = table.bottom - this.radius;
      this.vy *= -1;
    }

    // Apply friction
    const friction = 0.99;
    this.vx *= friction;
    this.vy *= friction;

    // Stop if very slow
    if (Math.abs(this.vx) < 1) this.vx = 0;
    if (Math.abs(this.vy) < 1) this.vy = 0;

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    this.angularVelocity = speed / this.radius;

    this.rotation += this.angularVelocity * dt;

    if (speed < 2) this.angularVelocity = 0;
  }

draw(Canvas2D, lamp) {

  if (!this.sprite) return;

  const ctx = Canvas2D.ctx;

  /* ===== Dynamic Shadow ===== */

  const dx = this.x - lamp.x;
  const dy = this.y - lamp.y;

  let dist = Math.sqrt(dx*dx + dy*dy);
  if(dist === 0) dist = 0.0001;

  const nx = dx / dist;
  const ny = dy / dist;

  const shadowOffset = 12;

  const shadowX = this.x + nx * shadowOffset;
  const shadowY = this.y + ny * shadowOffset;

  ctx.save();

  ctx.globalAlpha = 0.25;
  ctx.filter = "blur(3px)";
  ctx.fillStyle = "black";

  ctx.beginPath();
  ctx.ellipse(
    shadowX,
    shadowY,
    this.radius * 0.9,
    this.radius * 0.45,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();
  ctx.restore();


  /* ===== Ball (rotating) ===== */

  ctx.save();

  ctx.translate(this.x, this.y);
  ctx.rotate(this.rotation || 0);

  ctx.drawImage(
    this.sprite,
    -this.radius,
    -this.radius,
    this.radius*2,
    this.radius*2
  );

  ctx.restore();


  /* ===== Light Reflection (NO rotation) ===== */

  ctx.save();

  ctx.beginPath();
  ctx.arc(
    this.x - this.radius * 0.35,
    this.y - this.radius * 0.35,
    this.radius * 0.28,
    0,
    Math.PI*2
  );

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fill();

  ctx.restore();

}
}
