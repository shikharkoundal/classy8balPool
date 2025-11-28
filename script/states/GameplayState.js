// script/states/GameplayState.js
import Ball from "../game_objects/Ball.js";
import Vector2 from "../geom/Vector2.js";
import GamePolicy from "../GamePolicy.js";
import Canvas2D from "../Canvas2D.js";
import { sprites } from "../Assets.js";

import PhysicsWorld from "../physics/PhysicsWorld.js";
import PocketSystem from "../systems/PocketSystem.js";
import FloatingTextSystem from "../systems/FloatingTextSystem.js";
import TurnManager from "../systems/TurnManager.js";
import RuleEngine from "../systems/RuleEngine.js";
import { eventBus } from "../systems/EventBus.js";
import Mouse from "../input/Mouse.js";

function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

export default class GameplayState {
    constructor(game, gsm) {
        this.game = game;
        this.gsm = gsm;

        // aim/power
        this.aimAngle = 0;
        this.power = 0;
        this.maxPower = 6000;
        this.powerChargeSpeed = 12000;
        this.isCharging = false;

        // systems will be created onEnter
        this.physics = null;
        this.pockets = null;
        this.floating = null;
        this.turns = null;
        this.rules = null;

        // shot state
        this.ballInHand = false;
        this.readyForShot = true;
        this.shotTaken = false;

        this.firstContactBall = null;
        this.pottedColors = [];
        this._shotStartScore = { red: 0, yellow: 0 };
        this.foulThisShot = false;

        // scores
        this.scoreRed = 0;
        this.scoreYellow = 0;
        this.totalRed = 7;
        this.totalYellow = 7;
        this.foulCount = 0;

        this.invalidPlacementFlash = 0;
        this.gameOver = null;

        // hooks
        this._unsubFirst = null;
        this._unsubAllStopped = null;
        this._unsubPocketed = null;
    }

    // ------------------------------------------------------------------
    // Mouse handlers (use direct x/y assignment - Vector2.set may not exist)
    // ------------------------------------------------------------------
    handleMouseMove(x, y) {
        if (this.gameOver) return;

        if (this.ballInHand) {
            const newX = Math.max(this.policy.leftBorderX + this.cueBall.radius,
                Math.min(this.policy.rightBorderX - this.cueBall.radius, x));
            const newY = Math.max(this.policy.topBorderY + this.cueBall.radius,
                Math.min(this.policy.bottomBorderY - this.cueBall.radius, y));

            if (this._isValidCueBallPlacement(newX, newY)) {
                this.cueBall.position.x = newX;
                this.cueBall.position.y = newY;
            } else {
                this.invalidPlacementFlash = 5;
            }
            return;
        }

        if (!this.readyForShot) return;
        const dx = x - this.cueBall.position.x;
        const dy = y - this.cueBall.position.y;
        this.aimAngle = Math.atan2(dy, dx);
    }

    handleMouseDown() {
        if (this.gameOver) return;
        if (this.ballInHand) return;
        if (!this.readyForShot) return;
        this.isCharging = true;
    }

    handleMouseUp() {
        if (this.gameOver) return;

        if (this.ballInHand) {
            if (this._isValidCueBallPlacement(this.cueBall.position.x, this.cueBall.position.y)) {
                this.ballInHand = false;
                this.readyForShot = true;
            } else {
                this.invalidPlacementFlash = 10;
            }
            this.power = 0;
            this.isCharging = false;
            return;
        }

        if (!this.isCharging) return;

        // begin shot
        this.shotTaken = true;
        this.readyForShot = false;
        this.firstContactBall = null;
        this.pottedColors = [];
        this.foulThisShot = false;
        this._shotStartScore = { red: this.scoreRed, yellow: this.scoreYellow };

        // let physics/collisions know new shot started
        eventBus.emit("shotStart", {});

        // listen for first contact during this shot
        if (this._unsubFirst) this._unsubFirst();
        this._unsubFirst = eventBus.on("firstContact", (ball) => {
            if (!this.firstContactBall) this.firstContactBall = ball;
        });

        // listen for pockets
        if (this._unsubPocketed) this._unsubPocketed();
        this._unsubPocketed = eventBus.on("ballPocketed", ({ ball, pocketPos }) => {
            const color = this._getBallColor(ball);
            this.pottedColors.push(color);

            if (color === "red") {
                this.scoreRed++;
                this.floating.spawn("+1", ball.position.x, ball.position.y);
            }
            if (color === "yellow") {
                this.scoreYellow++;
                this.floating.spawn("+1", ball.position.x, ball.position.y);
            }

            // mark animation properties
            ball.isAnimating = true;
            ball.pocketAnim = {
                timer: 0,
                duration: 0.55,
                startX: ball.position.x,
                startY: ball.position.y,
                targetX: Math.round(pocketPos.x),
                targetY: Math.round(pocketPos.y)
            };
            ball.inHole = true;
        });

        // finally shoot
        this.cueBall.shoot(this.power, this.aimAngle);

        this.isCharging = false;
        this.power = 0;
    }

    // ------------------------------------------------------------------
    // onEnter - initialize systems & table
    // ------------------------------------------------------------------
    onEnter() {
        this.policy = new GamePolicy(this.game);

        // create systems
        this.physics = new PhysicsWorld(this.policy);
        this.pockets = new PocketSystem(this.policy);
        this.floating = new FloatingTextSystem();
        this.turns = new TurnManager();
        this.rules = new RuleEngine(this.turns, { red: this.totalRed, yellow: this.totalYellow });

        // cue ball
        this.cueBall = new Ball(new Vector2(150, 400));
        this.cueBall.scale = 1;
        this.cueBall.isCueBall = true;

        // table balls
        this.balls = [ this.cueBall ];
        const RX = 1000, RY = 400, G = 38;
        const layout = [
            [0,0,"spr_red"],
            [1,-0.5,"spr_red"], [1,0.5,"spr_yellow"],
            [2,-1,"spr_yellow"], [2,0,"spr_black"], [2,1,"spr_red"],
            [3,-1.5,"spr_red"], [3,-0.5,"spr_yellow"], [3,0.5,"spr_red"], [3,1.5,"spr_yellow"],
            [4,-2,"spr_yellow"], [4,-1,"spr_red"], [4,0,"spr_yellow"],
            [4,1,"spr_yellow"], [4,2,"spr_red"]
        ];

        for (const row of layout) {
            const [col, off, color] = row;
            const b = new Ball(
                new Vector2(RX + col * G, RY + off * G),
                sprites[color]
            );
            b.scale = 1;
            this.balls.push(b);
        }

        // reset gameplay state
        this.scoreRed = 0;
        this.scoreYellow = 0;
        this.foulCount = 0;
        this.ballInHand = false;
        this.readyForShot = true;
        this.shotTaken = false;
        this.firstContactBall = null;
        this.pottedColors = [];
        this.foulThisShot = false;
        this.invalidPlacementFlash = 0;
        this.floating.items = [];
        this.gameOver = null;

        // subscribe to allBallsStopped to finish shot processing if needed
        if (this._unsubAllStopped) this._unsubAllStopped();
        this._unsubAllStopped = eventBus.on("allBallsStopped", () => {
            if (this.shotTaken) {
                // ensure shotTaken toggled only here
                this.shotTaken = false;
                this._onShotComplete();
            }
        });
        // -----------------------------------------
        // NEW: Cue ball pocket listener
        // -----------------------------------------
        if (this._unsubCuePocket) this._unsubCuePocket();
        this._unsubCuePocket = eventBus.on("cueBallPocketed", () => {
            console.log("Cue ball scratched!");
            this.foulThisShot = true;   // mark immediate foul
        });

    }

    // ------------------------------------------------------------------
    // internal helpers
    // ------------------------------------------------------------------
    _isValidCueBallPlacement(x, y) {
        const r = this.cueBall.radius;
        for (const b of this.balls) {
            if (!b || b === this.cueBall || b.inHole || b.isAnimating) continue;
            const dx = x - b.position.x;
            const dy = y - b.position.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < r*2 - 1) return false;
        }
        return true;
    }

    _getBallColor(ball) {
        if (!ball || !ball.sprite) return "cue";
        if (ball.sprite === sprites.spr_red) return "red";
        if (ball.sprite === sprites.spr_yellow) return "yellow";
        if (ball.sprite === sprites.spr_black) return "black";
        return "cue";
    }

    _onShotComplete() {
        // prepare context for rule engine
        const ctx = {
            shooter: this.turns.current,
            firstContactBall: this.firstContactBall,
            pottedColors: this.pottedColors.slice(),
            scoreBefore: this._shotStartScore,
            scoreAfter: { red: this.scoreRed, yellow: this.scoreYellow },
            foulThisShot: this.foulThisShot
        };

        const result = this.rules.evaluateShot(ctx);

        // assignment
        if (result.assign) {
            this.turns.assign(result.assign.player, result.assign.group);
        }

        // fouls -> next player gets ball-in-hand
  // fouls -> increment and give ball-in-hand to opponent
        if (result.foul || this.foulThisShot) {

            this.foulCount++;
            this.turns.next();

            // Start ball in hand NOW
            this.ballInHand = true;

            // Make sure cue is removed from hole state
            this.cueBall.inHole = false;
            this.cueBall.isAnimating = false;
            this.cueBall.removeMe = false;
            this.cueBall.scale = 1;

            // Reset speed
            this.cueBall.velocity.x = 0;
            this.cueBall.velocity.y = 0;

            // TEMP SAFE POSITION
            this.cueBall.position.x = this.policy.leftBorderX + 150;
            this.cueBall.position.y = this.policy.topBorderY + 200;

            this.foulThisShot = false;
            return;
        }




        // game over
        if (result.gameOver) {
            this.gameOver = result.gameOver;
            return;
        }

        // turn switching
        if (result.switchTurn) {
            this.turns.next();
        } else {
            // shooter continues
        }

        // cleanup removed pocketed balls
        this.balls = this.balls.filter(b => !b.removeMe);

        // ensure cue ball present
        if (!this.balls.find(x => x.isCueBall)) {
            const newCue = new Ball(new Vector2(150, 400));
            newCue.isCueBall = true;
            this.balls.unshift(newCue);
            this.cueBall = newCue;
        }

        // ready for next shot (unless ball-in-hand or game over)
        this.readyForShot = !this.gameOver && !this.ballInHand;
    }

    // ------------------------------------------------------------------
    // update loop
    // ------------------------------------------------------------------
    update(dt) {
        // update floating texts first (they draw in HUD)
        if (this.floating) this.floating.update(dt);

        if (this.isCharging) {
            this.power += this.powerChargeSpeed * dt;
            this.power = Math.min(this.power, this.maxPower);
        }

        // ball-in-hand movement
        if (this.ballInHand) {
            this.cueBall.inHole = false;
            this.cueBall.isAnimating = false;
            const mx = Mouse.position.x;
            const my = Mouse.position.y;
            const clampedX = Math.max(this.policy.leftBorderX + this.cueBall.radius,
                Math.min(this.policy.rightBorderX - this.cueBall.radius, mx));
            const clampedY = Math.max(this.policy.topBorderY + this.cueBall.radius,
                Math.min(this.policy.bottomBorderY - this.cueBall.radius, my));
            if (this._isValidCueBallPlacement(clampedX, clampedY)) {
                this.cueBall.position.x = clampedX;
                this.cueBall.position.y = clampedY;
            }
            this.cueBall.velocity.x = 0;
            this.cueBall.velocity.y = 0;
            return;
        }

        // physics step (will emit firstContact & allBallsStopped etc.)
        if (this.physics) this.physics.step(this.balls, dt);

        // pocket detection
        if (this.pockets) this.pockets.detectAndStartPocket(this.balls);
        // if (this.cueBall.inHole) {
        //             // Cue ball scratch: DO NOT animate/scale/remove.
        //             // eventBus.emit("ballPocketed", { ball: b, pocketPos: nearest });

        //             this.cueBall.inHole = false;      // mark scratched
        //             this.cueBall.isAnimating = false; // 🟩 prevent pocket animation
        //             this.ballInHand = true;    // stay on table
        //             return;
        // }

        // animate pocketing balls
        for (const b of this.balls) {
            if (!b.isAnimating) continue;
            b.pocketAnim.timer += dt;
            const tRaw = b.pocketAnim.timer / b.pocketAnim.duration;
            const t = Math.min(1, tRaw);
            const e = easeOutQuad(t);

            b.position.x = b.pocketAnim.startX + (b.pocketAnim.targetX - b.pocketAnim.startX) * e;
            b.position.y = b.pocketAnim.startY + (b.pocketAnim.targetY - b.pocketAnim.startY) * e;
            b.scale = Math.max(0.01, 1 - e);

            if (t >= 1) b.removeMe = true;
        }

        // cleanup removed balls
        if (this.balls.some(b => b.removeMe)) {
            this.balls = this.balls.filter(b => !b.removeMe);
        }
    }

    // ------------------------------------------------------------------
    // draw
    // ------------------------------------------------------------------
    draw() {
        Canvas2D.clear();
        Canvas2D.drawImage(sprites.background, new Vector2(0, 0));

        // draw balls (anim scale)
        for (const b of this.balls) {
            if (!b.visible) continue;
            if (b.isAnimating) {
                Canvas2D.drawImage(b.sprite, b.position, 0, b.scale, new Vector2(b.radius, b.radius));
            } else {
                b.draw();
            }
        }

        // cue stick
        if (!this.cueBall.moving && !this.cueBall.inHole && !this.ballInHand && !this.gameOver) {
            const stickDist = 15 + (this.power / this.maxPower) * 60;
            const sx = this.cueBall.position.x - Math.cos(this.aimAngle) * stickDist;
            const sy = this.cueBall.position.y - Math.sin(this.aimAngle) * stickDist;
            Canvas2D.drawImage(
                sprites.spr_stick,
                new Vector2(sx, sy),
                this.aimAngle,
                1,
                new Vector2(sprites.spr_stick.width + 10, sprites.spr_stick.height / 2)
            );
        }

        // power bar
        if (this.isCharging && !this.gameOver) {
            const ctx = Canvas2D._ctx;
            const pct = this.power / this.maxPower;
            ctx.fillStyle = "#000";
            ctx.fillRect(50, 760, 200, 20);
            ctx.fillStyle = "#0f0";
            ctx.fillRect(50, 760, 200 * pct, 20);
            ctx.strokeStyle = "#fff";
            ctx.strokeRect(50, 760, 200, 20);
        }

        // floating texts
        const ctx = Canvas2D._ctx;
        this.floating.draw(ctx);

        // ball-in-hand UI
        if (this.ballInHand) {
            ctx.fillStyle = "yellow";
            ctx.font = "24px Arial";
            ctx.fillText("Place cue ball (click to drop)", 600, 50);
        }

        // invalid placement visual
        if (this.invalidPlacementFlash > 0) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.cueBall.position.x, this.cueBall.position.y, this.cueBall.radius + 6, 0, Math.PI * 2);
            ctx.stroke();
            this.invalidPlacementFlash--;
        }

        // HUD (right panel)
        {
            const pad = 10;
            const w = 300;
            const h = 150;
            const x = Canvas2D.canvas.width - w - 20;
            const y = 20;

            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = "#fff";
            ctx.strokeRect(x, y, w, h);

            ctx.textAlign = "left";
            ctx.fillStyle = "#fff";
            ctx.font = "18px Arial";
            ctx.fillText(`Mode: ${this.game.mode}`, x + pad, y + 24);

            ctx.fillStyle = this.turns.current === "A" ? "#ff7777" : "#fff";
            ctx.fillText(`Player A (Red): ${this.scoreRed}/${this.totalRed}`, x + pad, y + 24 + 26);

            ctx.fillStyle = this.turns.current === "B" ? "#ffff77" : "#fff";
            ctx.fillText(`Player B (Yellow): ${this.scoreYellow}/${this.totalYellow}`, x + pad, y + 24 + 52);

            ctx.fillStyle = "#ffcc00";
            ctx.font = "16px Arial";
            ctx.fillText(`Fouls: ${this.foulCount}`, x + pad, y + 24 + 78);

            ctx.fillStyle = "#ccc";
            ctx.font = "12px Arial";
            ctx.fillText("Black only after clearing your colors", x + pad, y + h - 12);
        }

        // game over
        if (this.gameOver) {
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.75)";
            ctx.fillRect(0, 300, Canvas2D.canvas.width, 200);
            ctx.fillStyle = "#fff";
            ctx.font = "42px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.gameOver.msg, Canvas2D.canvas.width / 2, 400);
            ctx.restore();
        }
    }
}
