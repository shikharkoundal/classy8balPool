// script/states/GameplayState.js
import Ball from "../game_objects/Ball.js";
import Vector2 from "../geom/Vector2.js";
import GamePolicy from "../GamePolicy.js";
import Canvas2D from "../Canvas2D.js";
import { sprites } from "../Assets.js";
import { collideAllBalls } from "../physics/BallCollision.js";

export default class GameplayState {
    constructor(game, gsm) {
        this.game = game;
        this.gsm = gsm;

        this.aimAngle = 0;
        this.power = 0;
        this.maxPower = 6000;
        this.powerChargeSpeed = 3000;
        this.isCharging = false;
    }

    handleMouseMove(x, y) {
        if (!this.cueBall || this.cueBall.moving) return;

        const dx = x - this.cueBall.position.x;
        const dy = y - this.cueBall.position.y;
        this.aimAngle = Math.atan2(dy, dx);
    }

    handleMouseDown() {
        if (!this.cueBall || this.cueBall.moving) return;
        this.isCharging = true;
    }

    handleMouseUp() {
        if (!this.cueBall || this.cueBall.moving) return;

        this.cueBall.shoot(this.power, this.aimAngle);

        this.power = 0;
        this.isCharging = false;
    }

    onEnter() {
        console.log("Game Started — Entered Gameplay");

        this.policy = new GamePolicy(this.game);

        // Create cue ball
        this.cueBall = new Ball(new Vector2(150, 400));
        
        // IMPORTANT: add cue ball to list
        this.balls = [ this.cueBall ];

        // -------------------------
        // CREATE THE RACK
        // -------------------------
        const RACK_X = 1000;
        const RACK_Y = 400;
        const GAP = 38;

        // Row 1
        this.balls.push(new Ball(new Vector2(RACK_X, RACK_Y), sprites.spr_red));

        // Row 2
        this.balls.push(new Ball(new Vector2(RACK_X + GAP, RACK_Y - GAP/2), sprites.spr_red));
        this.balls.push(new Ball(new Vector2(RACK_X + GAP, RACK_Y + GAP/2), sprites.spr_yellow));

        // Row 3
        this.balls.push(new Ball(new Vector2(RACK_X + GAP*2, RACK_Y - GAP), sprites.spr_yellow));
        this.balls.push(new Ball(new Vector2(RACK_X + GAP*2, RACK_Y), sprites.spr_black));
        this.balls.push(new Ball(new Vector2(RACK_X + GAP*2, RACK_Y + GAP), sprites.spr_red));

        // Row 4
        this.balls.push(new Ball(new Vector2(RACK_X + GAP*3, RACK_Y - GAP*1.5), sprites.spr_red));
        this.balls.push(new Ball(new Vector2(RACK_X + GAP*3, RACK_Y - GAP/2), sprites.spr_yellow));
        this.balls.push(new Ball(new Vector2(RACK_X + GAP*3, RACK_Y + GAP/2), sprites.spr_red));
        this.balls.push(new Ball(new Vector2(RACK_X + GAP*3, RACK_Y + GAP*1.5), sprites.spr_yellow));

        // Row 5
        this.balls.push(new Ball(new Vector2(RACK_X + GAP*4, RACK_Y - GAP*2), sprites.spr_yellow));
        this.balls.push(new Ball(new Vector2(RACK_X + GAP*4, RACK_Y - GAP), sprites.spr_red));
        this.balls.push(new Ball(new Vector2(RACK_X + GAP*4, RACK_Y), sprites.spr_yellow));
        this.balls.push(new Ball(new Vector2(RACK_X + GAP*4, RACK_Y + GAP), sprites.spr_yellow));
        this.balls.push(new Ball(new Vector2(RACK_X + GAP*4, RACK_Y + GAP*2), sprites.spr_red));
    }

    update(dt) {
        if (this.isCharging) {
            this.power += this.powerChargeSpeed * dt;
            if (this.power > this.maxPower) this.power = this.maxPower;
        }

        // Physics update
        for (const b of this.balls) {
            if (b.inHole) continue;

            b.integratePosition(dt);
            b.applyFrictionScaled(dt);
            b.borderBounce(this.policy);

            if (this.policy.isBallInPocket(b)) {
                b.inHole = true;
                b.visible = false;
                b.velocity.x = b.velocity.y = 0;
            }
        }

        // Ball-ball collisions
        collideAllBalls(this.balls);
    }

    draw() {
        Canvas2D.clear();
        Canvas2D.drawImage(sprites.background, new Vector2(0, 0));

        for (const b of this.balls) b.draw();

        // Draw cue stick
       // Draw cue stick (behind ball)
        if (!this.cueBall.moving && !this.cueBall.inHole) {

            const TIP_OFFSET_X = -10;  // tune left/right
            const TIP_OFFSET_Y = 0;   // tune up/down

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




        if (this.isCharging) {
            const pct = this.power / this.maxPower;
            const ctx = Canvas2D._ctx;

            ctx.fillStyle = "#000";
            ctx.fillRect(50, 760, 200, 20);

            ctx.fillStyle = "#0f0";
            ctx.fillRect(50, 760, 200 * pct, 20);
        }
    }
}
