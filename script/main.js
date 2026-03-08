// import Canvas2D from "./core/Canvas2D.js";
// import GameLoop from "./core/GameLoop.js";
// import Ball from "./game/Ball.js";
// import { loadAssets, sprites } from "./Assets.js";
// import HUD from "./game/HUD.js";
// import AI from "./game/AI.js";

// /* ============================= */
// /* GLOBAL GAME STATE */
// /* ============================= */

// let balls = [];
// let cueBall;

// let mouse = { x: 0, y: 0 };
// let isCharging = false;
// let power = 0;
// const maxPower = 2500;

// let scratchThisTurn = false;
// let gameOver = false;
// let winner = null;

// let playerGroup = { A: null, B: null };
// let gameMode = "ai";
// let aiPlayer = "B";
// let currentPlayer = "A";

// let shotInProgress = false;
// let ballPocketedThisTurn = false;

// let aiDifficulty = "medium";

// let playerStats = {
//   A: { shots: 0, scored: 0 },
//   B: { shots: 0, scored: 0 },
// };

// /* ============================= */
// /* TABLE SETUP */
// /* ============================= */

// const TABLE = {
//   left: 50,
//   right: 950,
//   top: 50,
//   bottom: 550,
// };

// const POCKET_RADIUS = 35;

// const pockets = [
//   { x: TABLE.left, y: TABLE.top },
//   { x: (TABLE.left + TABLE.right) / 2, y: TABLE.top },
//   { x: TABLE.right, y: TABLE.top },

//   { x: TABLE.left, y: TABLE.bottom },
//   { x: (TABLE.left + TABLE.right) / 2, y: TABLE.bottom },
//   { x: TABLE.right, y: TABLE.bottom },
// ];

// /* ============================= */
// /* GAME START */
// /* ============================= */

// async function startGame() {

//   Canvas2D.init("screen", 1000, 600);

//   await loadAssets();

//   cueBall = new Ball(250, 300, 20, "white", sprites.spr_ball);
//   balls.push(cueBall);

//   const startX = 700;
//   const startY = 300;
//   const spacing = 42;

//   const rackColors = [
//     "red","yellow","red","yellow","red",
//     "yellow","red","black","yellow","red",
//     "yellow","red","yellow","red","yellow"
//   ];

//   let index = 0;

//   for (let i = 0; i < 5; i++) {
//     for (let j = 0; j <= i; j++) {

//       const x = startX + i * spacing;
//       const y = startY - (i * spacing) / 2 + j * spacing;

//       const color = rackColors[index++];

//       balls.push(
//         new Ball(
//           x,
//           y,
//           20,
//           color,
//           sprites["spr_" + color]
//         )
//       );
//     }
//   }

//   attachInput();

//   const loop = new GameLoop(update, render);
//   loop.start();
// }

// startGame();

// /* ============================= */
// /* INPUT */
// /* ============================= */

// function attachInput() {

//   Canvas2D.canvas.addEventListener("mousemove", (e) => {

//     if (gameOver) return;

//     const rect = Canvas2D.canvas.getBoundingClientRect();

//     mouse.x = e.clientX - rect.left;
//     mouse.y = e.clientY - rect.top;
//   });

//   Canvas2D.canvas.addEventListener("mousedown", () => {

//     if (gameOver) return;
//     if (ballsAreMoving()) return;
//     if (gameMode === "ai" && currentPlayer === aiPlayer) return;

//     isCharging = true;
//   });

//   Canvas2D.canvas.addEventListener("mouseup", () => {

//     if (gameOver) return;
//     if (!isCharging) return;

//     shootBall();

//     isCharging = false;
//     power = 0;
//   });

//   window.addEventListener("keydown", (e) => {

//     if (e.key === "r" && gameOver) {
//       location.reload();
//     }

//   });
// }

// /* ============================= */
// /* GAME LOGIC */
// /* ============================= */

// function shootBall() {

//   const dx = mouse.x - cueBall.x;
//   const dy = mouse.y - cueBall.y;

//   const length = Math.sqrt(dx * dx + dy * dy);
//   if (length === 0) return;

//   const nx = dx / length;
//   const ny = dy / length;

//   cueBall.vx = nx * power;
//   cueBall.vy = ny * power;

//   playerStats[currentPlayer].shots++;

//   shotInProgress = true;
//   ballPocketedThisTurn = false;
// }

// function ballsAreMoving() {
//   return balls.some(
//     b => Math.abs(b.vx) > 5 || Math.abs(b.vy) > 5
//   );
// }

// function allBallsStopped() {
//   return !ballsAreMoving();
// }

// function update(dt) {

//   if (isCharging) {

//     power += 3000 * dt;

//     if (power > maxPower) power = maxPower;
//   }

//   for (const ball of balls) {
//     ball.update(dt, TABLE);
//   }

//   /* Collision */

//   for (let i = 0; i < balls.length; i++) {
//     for (let j = i + 1; j < balls.length; j++) {

//       handleBallCollision(balls[i], balls[j]);

//     }
//   }

//   /* Pocket Detection */

//   for (let i = balls.length - 1; i >= 0; i--) {

//     const ball = balls[i];

//     if (!checkPocket(ball)) continue;

//     if (ball === cueBall) {

//       scratchThisTurn = true;

//       ball.x = 250;
//       ball.y = 300;

//       ball.vx = 0;
//       ball.vy = 0;

//       continue;
//     }

//     if (ball.color === "black") {

//       const opponent = currentPlayer === "A" ? "B" : "A";

//       const remaining = balls.filter(
//         b => b.color === playerGroup[currentPlayer]
//       ).length;

//       winner = remaining === 0 ? currentPlayer : opponent;

//       gameOver = true;

//       return;
//     }

//     balls.splice(i, 1);

//     ballPocketedThisTurn = true;

//     playerStats[currentPlayer].scored++;
//   }

//   if (shotInProgress && allBallsStopped()) {

//     shotInProgress = false;

//     if (scratchThisTurn || !ballPocketedThisTurn) {

//       currentPlayer = currentPlayer === "A" ? "B" : "A";
//     }

//     scratchThisTurn = false;
//   }

//   /* AI Turn */

//   if (
//     !shotInProgress &&
//     gameMode === "ai" &&
//     currentPlayer === aiPlayer &&
//     !ballsAreMoving()
//   ) {

//     AI.takeShot({
//       balls,
//       cueBall,
//       pockets,
//       playerGroup,
//       aiPlayer,
//       currentPlayer,
//       aiDifficulty,
//       playerStats
//     });

//     shotInProgress = true;

//     ballPocketedThisTurn = false;
//   }
// }

// /* ============================= */
// /* RENDER */
// /* ============================= */

// function render() {

//   const ctx = Canvas2D.ctx;

//   Canvas2D.clear();

//   /* Background */

//   const gradient = ctx.createRadialGradient(
//     500,300,200,
//     500,300,900
//   );

//   gradient.addColorStop(0,"#1a1a1a");
//   gradient.addColorStop(1,"#000");

//   ctx.fillStyle = gradient;
//   ctx.fillRect(0,0,1000,600);

//   /* Table */

//   if (sprites.background) {
//     ctx.drawImage(
//       sprites.background,
//       0,
//       0,
//       1000,
//       600
//     );
//   }

//   // Table spotlight lighting
// const tableLight = ctx.createRadialGradient(
//     500, 300, 100,
//     500, 300, 600
// );

// tableLight.addColorStop(0, "rgba(255,255,255,0.08)");
// tableLight.addColorStop(1, "rgba(0,0,0,0.25)");

// ctx.fillStyle = tableLight;
// ctx.fillRect(0, 0, 1000, 600);

//   /* Pockets */

//   for (const pocket of pockets) {

//     Canvas2D.drawCircle(
//       pocket.x,
//       pocket.y,
//       POCKET_RADIUS,
//       "black"
//     );

//   }

//   /* Balls */

//   for (const ball of balls) {
//     ball.draw(Canvas2D);
//   }

//   drawAimGuide(ctx);

//   /* Cue Stick */

//   if (!ballsAreMoving() && !gameOver) {

//     const dx = mouse.x - cueBall.x;
//     const dy = mouse.y - cueBall.y;

//     const angle = Math.atan2(dy,dx);

//     const stickLength = 300;

//     ctx.save();

//     ctx.translate(cueBall.x,cueBall.y);
//     ctx.rotate(angle);

//     const pullBack = isCharging
//       ? (power / maxPower) * 40
//       : 0;

//     ctx.drawImage(
//       sprites.spr_stick,
//       -stickLength - 20 - pullBack,
//       -10,
//       stickLength,
//       20
//     );

//     ctx.restore();
//   }

//   /* HUD */

//   HUD.render({
//     playerStats,
//     currentPlayer,
//     aiDifficulty
//   });

//   // ===== Power Meter =====

// if (!ballsAreMoving() && !gameOver) {

//   const meterWidth = 300;
//   const meterHeight = 12;

//   const x = (Canvas2D.canvas.width - meterWidth) / 2;
//   const y = Canvas2D.canvas.height - 40;

//   const powerPercent = power / maxPower;

//   const ctx = Canvas2D.ctx;

//   // Background
//   ctx.fillStyle = "rgba(255,255,255,0.1)";
//   ctx.fillRect(x, y, meterWidth, meterHeight);

//   // Power level
//   ctx.fillStyle = "#00ff88";
//   ctx.fillRect(x, y, meterWidth * powerPercent, meterHeight);

//   // Border
//   ctx.strokeStyle = "rgba(255,255,255,0.2)";
//   ctx.strokeRect(x, y, meterWidth, meterHeight);
// }

// }

// /* ============================= */
// /* COLLISION */
// /* ============================= */

// function handleBallCollision(a,b) {

//   const dx = b.x - a.x;
//   const dy = b.y - a.y;

//   const distance = Math.sqrt(dx*dx + dy*dy);

//   const minDist = a.radius + b.radius;

//   if (distance === 0 || distance >= minDist) return;

//   const nx = dx / distance;
//   const ny = dy / distance;

//   const overlap = minDist - distance;

//   a.x -= (nx * overlap) / 2;
//   a.y -= (ny * overlap) / 2;

//   b.x += (nx * overlap) / 2;
//   b.y += (ny * overlap) / 2;

//   const rvx = b.vx - a.vx;
//   const rvy = b.vy - a.vy;

//   const velAlongNormal = rvx*nx + rvy*ny;

//   if (velAlongNormal > 0) return;

//   const restitution = 0.93;

//   const j = (-(1+restitution)*velAlongNormal)/2;

//   const impulseX = j*nx;
//   const impulseY = j*ny;

//   a.vx -= impulseX;
//   a.vy -= impulseY;

//   b.vx += impulseX;
//   b.vy += impulseY;
// }

// /* ============================= */
// /* POCKET CHECK */
// /* ============================= */

// function checkPocket(ball) {

//   return pockets.some(p => {

//     const dx = ball.x - p.x;
//     const dy = ball.y - p.y;

//     return Math.sqrt(dx*dx + dy*dy) < POCKET_RADIUS;

//   });
// }

// function drawAimGuide(ctx) {

//   if (ballsAreMoving() || gameOver) return;

//   const dx = mouse.x - cueBall.x;
//   const dy = mouse.y - cueBall.y;

//   const length = Math.sqrt(dx * dx + dy * dy);
//   if (length === 0) return;

//   const nx = dx / length;
//   const ny = dy / length;

//   let closestBall = null;
//   let closestDist = Infinity;

//   for (const ball of balls) {

//     if (ball === cueBall) continue;

//     const bx = ball.x - cueBall.x;
//     const by = ball.y - cueBall.y;

//     const proj = bx * nx + by * ny;
//     if (proj <= 0) continue;

//     const closestX = cueBall.x + nx * proj;
//     const closestY = cueBall.y + ny * proj;

//     const dist = Math.sqrt(
//       (ball.x - closestX) ** 2 +
//       (ball.y - closestY) ** 2
//     );

//     if (dist < ball.radius * 1.2 && proj < closestDist) {
//       closestBall = ball;
//       closestDist = proj;
//     }
//   }

//   ctx.save();
//   ctx.setLineDash([6,6]);
//   ctx.lineWidth = 2;
//   ctx.strokeStyle = "rgba(255,255,255,0.6)";

//   if (closestBall) {

//     const impactX = cueBall.x + nx * (closestDist - cueBall.radius * 2);
//     const impactY = cueBall.y + ny * (closestDist - cueBall.radius * 2);

//     /* Cue → Ghost line */

//     ctx.beginPath();
//     ctx.moveTo(cueBall.x, cueBall.y);
//     ctx.lineTo(impactX, impactY);
//     ctx.stroke();

//     /* Ghost ball */

//     ctx.beginPath();
//     ctx.arc(
//       impactX,
//       impactY,
//       cueBall.radius,
//       0,
//       Math.PI * 2
//     );
//     ctx.fillStyle = "rgba(255,255,255,0.15)";
//     ctx.fill();

//     /* Target ball predicted direction */

//     const tx = closestBall.x - impactX;
//     const ty = closestBall.y - impactY;

//     const tLen = Math.sqrt(tx * tx + ty * ty);
//     if (tLen > 0) {

//       const tnx = tx / tLen;
//       const tny = ty / tLen;

//       ctx.strokeStyle = "rgba(0,255,150,0.8)";

//       ctx.beginPath();
//       ctx.moveTo(closestBall.x, closestBall.y);
//       ctx.lineTo(
//         closestBall.x + tnx * 200,
//         closestBall.y + tny * 200
//       );
//       ctx.stroke();
//     }

//   } else {

//     ctx.beginPath();
//     ctx.moveTo(cueBall.x, cueBall.y);
//     ctx.lineTo(
//       cueBall.x + nx * 1000,
//       cueBall.y + ny * 1000
//     );
//     ctx.stroke();
//   }

//   ctx.restore();
// }
import Canvas2D from "core/Canvas2D.js";
import GameLoop from "core/GameLoop.js";
import GameStateManager from "core/GameStateManager.js";
import LoadingState from "states/LoadingState.js";

Canvas2D.init("screen",1000,600);

const manager = new GameStateManager();

manager.changeState(
  new LoadingState(manager)
);

const loop = new GameLoop(
  (dt)=>manager.update(dt),
  ()=>manager.render()
);

loop.start();