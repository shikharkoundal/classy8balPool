// script/states/GameplayState.js

import Ball from "../game_objects/Ball.js";
import Vector2 from "../geom/Vector2.js";
import GamePolicy from "../GamePolicy.js";
import Canvas2D from "../Canvas2D.js";
import { sprites } from "../Assets.js";
import { collideAllBalls } from "../physics/BallCollision.js";
import Mouse from "../input/Mouse.js";

export default class GameplayState {
    constructor(game, gsm) {
        this.game = game;
        this.gsm = gsm;

        this.aimAngle = 0;

        this.power = 0;
        this.maxPower = 6000;
        this.powerChargeSpeed = 3000;

        this.isCharging = false;

        this.ballInHand = false;
        this.readyForShot = true;
        this.shotTaken = false;

        this.invalidPlacementFlash = 0;
    }

    // ------------------------------------------------
    // VALIDATING CUE BALL PLACEMENT
    // ------------------------------------------------
    isValidCueBallPlacement(x, y) {
        const r = this.cueBall.radius;

        for (const b of this.balls) {
            if (b === this.cueBall || b.inHole || b.isAnimating) continue;

            const dx = x - b.position.x;
            const dy = y - b.position.y;
            const d = Math.sqrt(dx * dx + dy * dy);

            if (d < r * 2) return false;
        }

        return true;
    }

    // ------------------------------------------------
    // MOUSE MOVE
    // ------------------------------------------------
    handleMouseMove(x, y) {
        if (this.ballInHand) {
            // Clamp within table borders
            const newX = Math.max(this.policy.leftBorderX + this.cueBall.radius,
                          Math.min(this.policy.rightBorderX - this.cueBall.radius, x));
            const newY = Math.max(this.policy.topBorderY + this.cueBall.radius,
                          Math.min(this.policy.bottomBorderY - this.cueBall.radius, y));

            if (this.isValidCueBallPlacement(newX, newY)) {
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

    // ------------------------------------------------
    // MOUSE DOWN
    // ------------------------------------------------
    handleMouseDown() {
        if (this.ballInHand) return;
        if (!this.readyForShot) return;
        this.isCharging = true;
    }

    // ------------------------------------------------
    // MOUSE UP
    // ------------------------------------------------
    handleMouseUp() {
        // Placing cue ball?
        if (this.ballInHand) {
            if (this.isValidCueBallPlacement(this.cueBall.position.x, this.cueBall.position.y)) {
                this.ballInHand = false;
                this.readyForShot = true;
                this.invalidPlacementFlash = 0;
            } else {
                this.invalidPlacementFlash = 10;
            }
            this.isCharging = false;
            this.power = 0;
            return;
        }

        if (!this.isCharging) return;

        if (!this.readyForShot) {
            this.isCharging = false;
            this.power = 0;
            return;
        }

        // SHOOT
        this.cueBall.shoot(this.power, this.aimAngle);
        this.isCharging = false;
        this.power = 0;
        this.shotTaken = true;
    }

    // ------------------------------------------------
    // ENTER STATE
    // ------------------------------------------------
    onEnter() {
        this.policy = new GamePolicy(this.game);

        this.cueBall = new Ball(new Vector2(150, 400));
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

        for (let row of layout) {
            const [col, off, color] = row;
            this.balls.push(
                new Ball(
                    new Vector2(RX + col * G, RY + off * G),
                    sprites[color]
                )
            );
        }
    }

    // ------------------------------------------------
    // UPDATE LOOP
    // ------------------------------------------------
    update(dt) {
        // Power bar charging
        if (this.isCharging) {
            this.power += this.powerChargeSpeed * dt;
            this.power = Math.min(this.power, this.maxPower);
        }

        // Ball-in-hand mode
        if (this.ballInHand) {
            const mx = Mouse.position.x;
            const my = Mouse.position.y;

            const clampedX = Math.max(this.policy.leftBorderX + this.cueBall.radius,
                Math.min(this.policy.rightBorderX - this.cueBall.radius, mx));
            const clampedY = Math.max(this.policy.topBorderY + this.cueBall.radius,
                Math.min(this.policy.bottomBorderY - this.cueBall.radius, my));

            if (this.isValidCueBallPlacement(clampedX, clampedY)) {
                this.cueBall.position.x = clampedX;
                this.cueBall.position.y = clampedY;
            }

            this.cueBall.velocity.x = 0;
            this.cueBall.velocity.y = 0;

            return;
        }

        // Update active balls
        for (const b of this.balls) {

            // ----------------------------
            // Pocket animation step
            // ----------------------------
            if (b.isAnimating) {
                b.pocketAnim.timer += dt;
                const t = b.pocketAnim.timer / b.pocketAnim.duration;

                if (t >= 1) {
                    // Remove permanently
                    b.removeMe = true;
                    continue;
                }

                // Smooth motion
                b.position.x += (b.pocketAnim.targetX - b.position.x) * 0.1;
                b.position.y += (b.pocketAnim.targetY - b.position.y) * 0.1;

                // Shrink effect
                b.scale = 1 - t;

                continue; // skip physics
            }

            // Skip pocketed balls
            if (b.inHole) continue;

            // Regular physics
            b.integratePosition(dt);
            b.applyFrictionScaled(dt);
            b.borderBounce(this.policy);

            // Check pocket entry
            if (this.policy.isBallInPocket(b)) {

                if (b === this.cueBall) {
                    // Cue ball -> ball in hand
                    this.ballInHand = true;
                    b.velocity.x = b.velocity.y = 0;
                    b.inHole = false;
                    continue;
                }

                // START POCKET ANIMATION
                b.isAnimating = true;
                b.pocketAnim = {
                    timer: 0,
                    duration: 0.5,
                    targetX: this.policy.lastPocketX,
                    targetY: this.policy.lastPocketY
                };

                continue;
            }
        }

        // Remove animated finished balls
        this.balls = this.balls.filter(b => !b.removeMe);

        // Collisions among active balls
        const active = this.balls.filter(b => !b.inHole && !b.isAnimating);

        if (active.length > 1) collideAllBalls(active);

        // Determine shot completion
        const anyMoving = this.balls.some(b => b.moving && !b.inHole && !b.isAnimating);

        this.readyForShot = !anyMoving;
    }

    // ------------------------------------------------
    // DRAW LOOP
    // ------------------------------------------------
    draw() {
        Canvas2D.clear();
        Canvas2D.drawImage(sprites.background, new Vector2(0, 0));

        for (const b of this.balls) {
            if (b.visible !== false) b.draw();
        }

        // Stick
        if (!this.cueBall.moving && !this.cueBall.inHole && !this.ballInHand) {

            const TIP_OFFSET_X = -10;
            const TIP_OFFSET_Y = 0;
            const stickDist = 15 + (this.power / this.maxPower) * 60;

            const sx = this.cueBall.position.x - Math.cos(this.aimAngle) * stickDist;
            const sy = this.cueBall.position.y - Math.sin(this.aimAngle) * stickDist;

            const origin = new Vector2(
                sprites.spr_stick.width - TIP_OFFSET_X,
                sprites.spr_stick.height / 2 + TIP_OFFSET_Y
            );

            Canvas2D.drawImage(
                sprites.spr_stick,
                new Vector2(sx, sy),
                this.aimAngle,
                1,
                origin
            );
        }

        // Power bar
        if (this.isCharging) {
            const pct = this.power / this.maxPower;
            const ctx = Canvas2D._ctx;
            ctx.fillStyle = "#000";
            ctx.fillRect(50, 760, 200, 20);
            ctx.fillStyle = "#0f0";
            ctx.fillRect(50, 760, 200 * pct, 20);
        }

        // Ball-in-hand UI
        if (this.ballInHand) {
            const ctx = Canvas2D._ctx;
            ctx.fillStyle = "yellow";
            ctx.font = "28px Arial";
            ctx.fillText("Place the cue ball", 600, 50);
        }

        // Invalid placement flash
        if (this.invalidPlacementFlash > 0) {
            const ctx = Canvas2D._ctx;
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.cueBall.position.x, this.cueBall.position.y, this.cueBall.radius + 4, 0, Math.PI * 2);
            ctx.stroke();
            this.invalidPlacementFlash--;
        }
    }
}
