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

        // optional visual feedback counters
        this.invalidPlacementFlash = 0;
    }

    // Check if cue ball placement at (x,y) would overlap any non-pocketed ball.
    isValidCueBallPlacement(x, y) {
        const radius = this.cueBall.radius;

        for (const b of this.balls) {
            if (b === this.cueBall || b.inHole) continue;

            const dx = x - b.position.x;
            const dy = y - b.position.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < radius * 2) {
                return false; // overlaps
            }
        }

        // also optionally ensure it's inside table borders
        const l = this.policy.leftBorderX + this.cueBall.radius;
        const r = this.policy.rightBorderX - this.cueBall.radius;
        const t = this.policy.topBorderY + this.cueBall.radius;
        const btm = this.policy.bottomBorderY - this.cueBall.radius;

        if (x < l || x > r || y < t || y > btm) return false;

        return true;
    }

    // -------------------------------
    // MOUSE MOVE
    // -------------------------------
    handleMouseMove(x, y) {
        // BALL-IN-HAND: move cue ball with mouse (but only if valid)
        if (this.ballInHand) {
            // Clamp to bounds and only move if placement not overlapping
            const clampedX = Math.max(this.policy.leftBorderX + this.cueBall.radius,
                                      Math.min(this.policy.rightBorderX - this.cueBall.radius, x));
            const clampedY = Math.max(this.policy.topBorderY + this.cueBall.radius,
                                      Math.min(this.policy.bottomBorderY - this.cueBall.radius, y));

            // show feedback while dragging; do not place on top of other balls
            if (this.isValidCueBallPlacement(clampedX, clampedY)) {
                this.cueBall.position.x = clampedX;
                this.cueBall.position.y = clampedY;
            } else {
                // still allow cursor-follow but visually indicate invalid placement by not snapping
                this.invalidPlacementFlash = Math.max(this.invalidPlacementFlash, 4);
            }

            // No aiming while placing
            return;
        }

        // aiming only when balls stopped
        if (!this.readyForShot) return;

        if (!this.cueBall) return;
        const dx = x - this.cueBall.position.x;
        const dy = y - this.cueBall.position.y;
        this.aimAngle = Math.atan2(dy, dx);
    }

    // -------------------------------
    // MOUSE DOWN
    // -------------------------------
    handleMouseDown() {
        // If currently placing cue ball, do nothing here (we handle placement on mouse up)
        if (this.ballInHand) return;

        if (!this.readyForShot) return;

        this.isCharging = true;
    }

    // -------------------------------
    // MOUSE UP
    // -------------------------------
    handleMouseUp() {
        // If placing cue ball, attempt to place it
        if (this.ballInHand) {
            if (this.isValidCueBallPlacement(this.cueBall.position.x, this.cueBall.position.y)) {
                // Place it — cue ball stays where it is; allow shooting afterwards
                this.ballInHand = false;
                this.readyForShot = true;
                this.invalidPlacementFlash = 0;
            } else {
                // invalid placement: keep ball-in-hand and flash
                this.invalidPlacementFlash = 10;
            }

            // always clear any power state
            this.isCharging = false;
            this.power = 0;
            return;
        }

        // normal shooting flow
        if (!this.isCharging) return;
        if (!this.readyForShot) {
            this.isCharging = false;
            this.power = 0;
            return;
        }

        // shoot the cue ball
        this.cueBall.shoot(this.power, this.aimAngle);
        this.shotTaken = true;

        this.isCharging = false;
        this.power = 0;
    }

    // -------------------------------
    // ON ENTER STATE
    // -------------------------------
    onEnter() {
        console.log("Game Started — Entered Gameplay");

        this.policy = new GamePolicy(this.game);

        // Create cue ball and balls array
        this.cueBall = new Ball(new Vector2(150, 400));
        this.balls = [ this.cueBall ];

        // Build rack
        const RACK_X = 1000;
        const RACK_Y = 400;
        const GAP = 38;

        this.balls.push(new Ball(new Vector2(RACK_X, RACK_Y), sprites.spr_red));

        this.balls.push(new Ball(new Vector2(RACK_X+GAP, RACK_Y-GAP/2), sprites.spr_red));
        this.balls.push(new Ball(new Vector2(RACK_X+GAP, RACK_Y+GAP/2), sprites.spr_yellow));

        this.balls.push(new Ball(new Vector2(RACK_X+GAP*2, RACK_Y-GAP), sprites.spr_yellow));
        this.balls.push(new Ball(new Vector2(RACK_X+GAP*2, RACK_Y), sprites.spr_black));
        this.balls.push(new Ball(new Vector2(RACK_X+GAP*2, RACK_Y+GAP), sprites.spr_red));

        this.balls.push(new Ball(new Vector2(RACK_X+GAP*3, RACK_Y-GAP*1.5), sprites.spr_red));
        this.balls.push(new Ball(new Vector2(RACK_X+GAP*3, RACK_Y-GAP/2), sprites.spr_yellow));
        this.balls.push(new Ball(new Vector2(RACK_X+GAP*3, RACK_Y+GAP/2), sprites.spr_red));
        this.balls.push(new Ball(new Vector2(RACK_X+GAP*3, RACK_Y+GAP*1.5), sprites.spr_yellow));

        this.balls.push(new Ball(new Vector2(RACK_X+GAP*4, RACK_Y-GAP*2), sprites.spr_yellow));
        this.balls.push(new Ball(new Vector2(RACK_X+GAP*4, RACK_Y-GAP), sprites.spr_red));
        this.balls.push(new Ball(new Vector2(RACK_X+GAP*4, RACK_Y), sprites.spr_yellow));
        this.balls.push(new Ball(new Vector2(RACK_X+GAP*4, RACK_Y+GAP), sprites.spr_yellow));
        this.balls.push(new Ball(new Vector2(RACK_X+GAP*4, RACK_Y+GAP*2), sprites.spr_red));
    }

    // -------------------------------
    // UPDATE LOOP
    // -------------------------------
    update(dt) {
        // power charging
        if (this.isCharging) {
            this.power += this.powerChargeSpeed * dt;
            if (this.power > this.maxPower) this.power = this.maxPower;
        }

        // Ball-in-hand movement (use Mouse import)
        if (this.ballInHand) {
            const newX = Mouse.position.x;
            const newY = Mouse.position.y;

            // clamp inside table
            const clampedX = Math.max(this.policy.leftBorderX + this.cueBall.radius,
                Math.min(this.policy.rightBorderX - this.cueBall.radius, newX));
            const clampedY = Math.max(this.policy.topBorderY + this.cueBall.radius,
                Math.min(this.policy.bottomBorderY - this.cueBall.radius, newY));

            if (this.isValidCueBallPlacement(clampedX, clampedY)) {
                this.cueBall.position.x = clampedX;
                this.cueBall.position.y = clampedY;
            } else {
                // allow following cursor but don't overlap
                // we keep last valid position
            }

            this.cueBall.velocity.x = 0;
            this.cueBall.velocity.y = 0;

            // skip physics while placing
            return;
        }

        // Work only on active (non-pocketed) balls
        const active = this.balls.filter(b => !b.inHole);

        // Physics update for active balls
        for (const b of active) {
            b.integratePosition(dt);
            b.applyFrictionScaled(dt);
            b.borderBounce(this.policy);

            // Pocket detection
            if (this.policy.isBallInPocket(b)) {
                // If cue ball pockets -> ball-in-hand
                if (b === this.cueBall) {
                    this.ballInHand = true;
                    b.moving = false;
                    b.visible = true;   // keep showing while placing
                    b.inHole = false;   // keep in list, allow placing
                    b.velocity.x = b.velocity.y = 0;
                    // stop physics for this frame (we're now in ball-in-hand)
                    return;
                }

                // Non-cue ball pocketed -> mark as inHole & hide
                b.inHole = true;
                b.visible = false;
                b.velocity.x = b.velocity.y = 0;
                b.moving = false;
                // continue: do not return; process remaining active balls
            }
        }

        // Run collisions only between active balls (non-pocketed)
        const activeAfterPocket = this.balls.filter(b => !b.inHole);
        if (activeAfterPocket.length > 1) {
            collideAllBalls(activeAfterPocket);
        }

        // Determine if all balls (non-pocketed) have stopped
        const anyMoving = this.balls.some(b => !b.inHole && b.moving);

        if (!anyMoving) {
            this.readyForShot = true;
            this.shotTaken = false;
        } else {
            this.readyForShot = false;
        }
    }

    // -------------------------------
    // DRAW LOOP
    // -------------------------------
    draw() {
        Canvas2D.clear();
        Canvas2D.drawImage(sprites.background, new Vector2(0, 0));

        for (const b of this.balls) b.draw();

        // Draw cue stick when ready and not placing
        if (!this.cueBall.moving && !this.cueBall.inHole && !this.ballInHand) {
            const TIP_OFFSET_X = -10;
            const TIP_OFFSET_Y = 0;

            const stickDist = 15 + (this.power / this.maxPower) * 60;

            const stickX = this.cueBall.position.x - Math.cos(this.aimAngle) * stickDist;
            const stickY = this.cueBall.position.y - Math.sin(this.aimAngle) * stickDist;

            const origin = new Vector2(
                sprites.spr_stick.width - TIP_OFFSET_X,
                sprites.spr_stick.height / 2 + TIP_OFFSET_Y
            );

            Canvas2D.drawImage(
                sprites.spr_stick,
                new Vector2(stickX, stickY),
                this.aimAngle,
                1,
                origin
            );
        }

        // Power bar
        if (this.isCharging) {
            const pct = Math.min(1, this.power / this.maxPower);
            const ctx = Canvas2D._ctx;

            ctx.fillStyle = "#000";
            ctx.fillRect(50, 760, 200, 20);

            ctx.fillStyle = "#0f0";
            ctx.fillRect(50, 760, 200 * pct, 20);
        }

        // Ball-in-hand message
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
            ctx.arc(this.cueBall.position.x, this.cueBall.position.y, this.cueBall.radius + 4, 0, Math.PI*2);
            ctx.stroke();

            this.invalidPlacementFlash--;
        }
    }
}
