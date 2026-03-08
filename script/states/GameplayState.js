import Canvas2D from "../core/Canvas2D.js";
import Ball from "../game/Ball.js";
import { sprites } from "../Assets.js";
import AI from "../game/AI.js";
import RulesEngine from "../game/RulesEngine.js";

export default class GameplayState {
  constructor(manager, mode) {
    this.manager = manager;
    this.mode = mode;

    this.balls = [];
    this.cueBall = null;

    this.mouse = { x: 0, y: 0 };

    this.isCharging = false;
    this.power = 0;
    this.maxPower = 2500;

    this.TABLE = {
      left: 50,
      right: 950,
      top: 50,
      bottom: 550,
    };

    this.POCKET_RADIUS = 35;

    this.pockets = [
      { x: 50, y: 50 },
      { x: 500, y: 50 },
      { x: 950, y: 50 },
      { x: 50, y: 550 },
      { x: 500, y: 550 },
      { x: 950, y: 550 },
    ];

    this.currentPlayer = "A";
    this.aiPlayer = "B";

    this.shotInProgress = false;
    this.ballPocketedThisTurn = false;
    this.scratchThisTurn = false;

    this.playerGroup = {
      A: null,
      B: null,
    };

    this.playerStats = {
      A: { shots: 0, scored: 0 },
      B: { shots: 0, scored: 0 },
    };

    this.aiDifficulty = "medium";

    this.gameOver = false;
    this.winner = null;

    this.lamp = {
  x: 500,
  y: 120
};
  }

  enter() {
    const canvas = Canvas2D.canvas;

    this.balls = [];

    /* Cue ball */

    this.cueBall = new Ball(250, 300, 20, "white", sprites.spr_ball);

    this.balls.push(this.cueBall);

    /* Rack */

    const startX = 700;
    const startY = 300;
    const spacing = 42;

    const rackColors = [
      "red",
      "yellow",
      "red",
      "yellow",
      "red",
      "yellow",
      "red",
      "black",
      "yellow",
      "red",
      "yellow",
      "red",
      "yellow",
      "red",
      "yellow",
    ];

    let index = 0;

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j <= i; j++) {
        const x = startX + i * spacing;
        const y = startY - (i * spacing) / 2 + j * spacing;

        const color = rackColors[index++];

        this.balls.push(new Ball(x, y, 20, color, sprites["spr_" + color]));
      }
    }

    /* INPUT */

    canvas.addEventListener(
      "mousemove",
      (this.mouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();

        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      }),
    );

    canvas.addEventListener(
      "mousedown",
      (this.mouseDown = () => {
        if (this.ballsAreMoving() || this.gameOver) return;
        this.isCharging = true;
      }),
    );

    canvas.addEventListener(
      "mouseup",
      (this.mouseUp = () => {
        if (!this.isCharging) return;

        this.shootBall();

        this.isCharging = false;
        this.power = 0;
      }),
    );
  }

  exit() {
    const canvas = Canvas2D.canvas;

    canvas.removeEventListener("mousemove", this.mouseMove);
    canvas.removeEventListener("mousedown", this.mouseDown);
    canvas.removeEventListener("mouseup", this.mouseUp);
  }

  update(dt) {
    /* Power charging */

    if (this.isCharging) {
      this.power += 3000 * dt;

      if (this.power > this.maxPower) {
        this.power = this.maxPower;
      }
    }

    /* Ball physics */

    for (const ball of this.balls) {
      ball.update(dt, this.TABLE);
    }

    /* Ball collisions */

    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        this.handleBallCollision(this.balls[i], this.balls[j]);
      }
    }

    /* Pocket detection */

    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];

      if (!this.checkPocket(ball)) continue;

      RulesEngine.handlePocket(this, ball);

      if (ball !== this.cueBall) {
        this.balls.splice(i, 1);

        this.playerStats[this.currentPlayer].scored++;
      }
    }

    /* Turn resolution */

    if (this.shotInProgress && !this.ballsAreMoving()) {
      this.shotInProgress = false;

      RulesEngine.resolveTurn(this);
    }

    /* AI Trigger */

    if (
      this.mode === "ai" &&
      this.currentPlayer === this.aiPlayer &&
      !this.shotInProgress &&
      !this.ballsAreMoving()
    ) {
      AI.takeShot(this);
    }
  }
  render() {
    const ctx = Canvas2D.ctx;

    ctx.clearRect(0, 0, Canvas2D.canvas.width, Canvas2D.canvas.height);

    /* Background */

    const gradient = ctx.createRadialGradient(500, 300, 200, 500, 300, 900);

    gradient.addColorStop(0, "#1a1a1a");
    gradient.addColorStop(1, "#000");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 600);

    /* Table */

    if (sprites.background) {
      ctx.drawImage(sprites.background, 0, 0, 1000, 600);
    }

    /* ===== TABLE LIGHTING ===== */

    const tableLight = ctx.createRadialGradient(500, 300, 100, 500, 300, 700);

    tableLight.addColorStop(0, "rgba(0,0,0,0)");
    tableLight.addColorStop(0.6, "rgba(0,0,0,0.15)");
    tableLight.addColorStop(1, "rgba(0,0,0,0.45)");

    ctx.fillStyle = tableLight;
    ctx.fillRect(0, 0, 1000, 600);

    /* Pockets */

    for (const p of this.pockets) {
      Canvas2D.drawCircle(p.x, p.y, this.POCKET_RADIUS, "black");
    }

    /* Balls */

for(const ball of this.balls){
  ball.draw(Canvas2D, this.lamp);
}

if(this.isCharging){

const ctx = Canvas2D.ctx;

ctx.beginPath();
ctx.arc(
this.cueBall.x,
this.cueBall.y,
this.cueBall.radius + 6,
0,
Math.PI*2
);

ctx.strokeStyle = "rgba(0,255,180,0.6)";
ctx.lineWidth = 2;

ctx.stroke();

}

    /* Aim guide */

    this.drawAimGuide(ctx);

    /* Cue stick */

    if (!this.ballsAreMoving()) {
      const dx = this.mouse.x - this.cueBall.x;
      const dy = this.mouse.y - this.cueBall.y;

      const angle = Math.atan2(dy, dx);

      const stickLength = 300;

      ctx.save();

      ctx.translate(this.cueBall.x, this.cueBall.y);

      ctx.rotate(angle);

      const pullBack = this.isCharging ? (this.power / this.maxPower) * 40 : 0;

      ctx.drawImage(
        sprites.spr_stick,
        -stickLength - 20 - pullBack,
        -10,
        stickLength,
        20,
      );

      ctx.restore();
    }

    this.drawPowerMeter(ctx);

    if (this.gameOver) {
      const ctx = Canvas2D.ctx;

      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(0, 0, 1000, 600);

      ctx.fillStyle = "white";
      ctx.font = "50px Arial";
      ctx.textAlign = "center";

      ctx.fillText(this.winner + " Wins!", 500, 300);
    }
  }

  shootBall() {
    const dx = this.mouse.x - this.cueBall.x;
    const dy = this.mouse.y - this.cueBall.y;

    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return;

    const nx = dx / length;
    const ny = dy / length;

    this.cueBall.vx = nx * this.power;
    this.cueBall.vy = ny * this.power;

    this.playerStats[this.currentPlayer].shots++;

    this.shotInProgress = true;
    this.ballPocketedThisTurn = false;
  }

  ballsAreMoving() {
    for (const ball of this.balls) {
      if (Math.abs(ball.vx) > 5 || Math.abs(ball.vy) > 5) {
        return true;
      }
    }

    return false;
  }

  handleBallCollision(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const minDist = a.radius + b.radius;

    if (distance === 0 || distance >= minDist) return;

    const nx = dx / distance;
    const ny = dy / distance;

    const overlap = minDist - distance;

    a.x -= (nx * overlap) / 2;
    a.y -= (ny * overlap) / 2;

    b.x += (nx * overlap) / 2;
    b.y += (ny * overlap) / 2;

    const rvx = b.vx - a.vx;
    const rvy = b.vy - a.vy;

    const velAlongNormal = rvx * nx + rvy * ny;

    if (velAlongNormal > 0) return;

    const restitution = 0.93;

    const j = (-(1 + restitution) * velAlongNormal) / 2;

    const impulseX = j * nx;
    const impulseY = j * ny;

    a.vx -= impulseX;
    a.vy -= impulseY;

    b.vx += impulseX;
    b.vy += impulseY;
  }

  checkPocket(ball) {
    for (const p of this.pockets) {
      const dx = ball.x - p.x;
      const dy = ball.y - p.y;

      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.POCKET_RADIUS) return true;
    }

    return false;
  }
  drawAimGuide(ctx) {
    if (this.ballsAreMoving()) return;

    const dx = this.mouse.x - this.cueBall.x;
    const dy = this.mouse.y - this.cueBall.y;

    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return;

    const nx = dx / length;
    const ny = dy / length;

    let closestBall = null;
    let closestDist = Infinity;

    for (const ball of this.balls) {
      if (ball === this.cueBall) continue;

      const bx = ball.x - this.cueBall.x;
      const by = ball.y - this.cueBall.y;

      const proj = bx * nx + by * ny;

      if (proj <= 0) continue;

      const closestX = this.cueBall.x + nx * proj;
      const closestY = this.cueBall.y + ny * proj;

      const dist = Math.sqrt(
        (ball.x - closestX) ** 2 + (ball.y - closestY) ** 2,
      );

      if (dist < ball.radius * 1.2 && proj < closestDist) {
        closestBall = ball;
        closestDist = proj;
      }
    }

    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.6)";

    if (closestBall) {
      const impactX =
        this.cueBall.x + nx * (closestDist - this.cueBall.radius * 2);

      const impactY =
        this.cueBall.y + ny * (closestDist - this.cueBall.radius * 2);

      /* cue → ghost ball */

      ctx.beginPath();
      ctx.moveTo(this.cueBall.x, this.cueBall.y);
      ctx.lineTo(impactX, impactY);
      ctx.stroke();

      /* ghost ball */

      ctx.beginPath();
      ctx.arc(impactX, impactY, this.cueBall.radius, 0, Math.PI * 2);

      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fill();

      /* target ball direction */

      const tx = closestBall.x - impactX;
      const ty = closestBall.y - impactY;

      const tLen = Math.sqrt(tx * tx + ty * ty);

      if (tLen > 0) {
        const tnx = tx / tLen;
        const tny = ty / tLen;

        ctx.strokeStyle = "rgba(0,255,150,0.9)";

        ctx.beginPath();
        ctx.moveTo(closestBall.x, closestBall.y);

        ctx.lineTo(closestBall.x + tnx * 200, closestBall.y + tny * 200);

        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(this.cueBall.x, this.cueBall.y);

      ctx.lineTo(this.cueBall.x + nx * 1000, this.cueBall.y + ny * 1000);

      ctx.stroke();
    }

    ctx.restore();
  }

drawPowerMeter(ctx){

if(!this.isCharging) return;

const meterWidth = 300;
const meterHeight = 14;

const x = (Canvas2D.canvas.width - meterWidth) / 2;
const y = Canvas2D.canvas.height - 50;

const powerPercent = this.power / this.maxPower;

/* Background */

ctx.fillStyle = "rgba(255,255,255,0.08)";
ctx.fillRect(x,y,meterWidth,meterHeight);

/* Power Fill */

const gradient = ctx.createLinearGradient(x,0,x+meterWidth,0);

gradient.addColorStop(0,"#00ff88");
gradient.addColorStop(0.6,"#ffee00");
gradient.addColorStop(1,"#ff3b3b");

ctx.fillStyle = gradient;

ctx.fillRect(
x,
y,
meterWidth * powerPercent,
meterHeight
);

/* Border */

ctx.strokeStyle = "rgba(255,255,255,0.25)";
ctx.strokeRect(x,y,meterWidth,meterHeight);

}

}


