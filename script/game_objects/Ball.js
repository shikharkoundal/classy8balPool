// script/game_objects/Ball.js
import Vector2 from "../geom/Vector2.js";
import Canvas2D from "../Canvas2D.js";
import { sprites } from "../Assets.js";

export const BALL_DIAMETER = 50;
export const BALL_RADIUS = BALL_DIAMETER / 2;

// friction model: FRIC_PER_SEC is multiplicative per second.
// We'll apply it once per frame (scaled by dt)
const FRIC_PER_SEC = 0.995; // <--- tune this (closer to 1 = less friction)
const STOP_T = .5;            // velocity magnitude under which we stop

export default class Ball {
    constructor(position, sprite = sprites.ball) {
        this.position = position.clone();
        this.velocity = new Vector2(0, 0);
        this.radius = BALL_RADIUS;

        this.sprite = sprite;
        this.origin = new Vector2(BALL_RADIUS, BALL_RADIUS);

        this.moving = false;
        this.visible = true;
        this.inHole = false;
    }

    shoot(power, angle) {
        // tuned scale: change if needed
        const speed = power * 0.5;
        this.velocity.x = Math.cos(angle) * speed;
        this.velocity.y = Math.sin(angle) * speed;
        this.moving = true;
        console.log("SHOOT SPEED:", this.velocity);
    }

    // move by dt (no friction here). returns nothing.
    integratePosition(dt) {
        // simple Euler step
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }

    // border collision (in-place) — resolves position and reflects velocity
    borderBounce(policy) {
        const l = policy.leftBorderX + this.radius;
        const r = policy.rightBorderX - this.radius;
        const t = policy.topBorderY + this.radius;
        const b = policy.bottomBorderY - this.radius;

        if (this.position.x < l) {
            this.position.x = l;
            this.velocity.x *= -1;
            this.moving = true;
        } else if (this.position.x > r) {
            this.position.x = r;
            this.velocity.x *= -1;
            this.moving = true;
        }

        if (this.position.y < t) {
            this.position.y = t;
            this.velocity.y *= -1;
            this.moving = true;
        } else if (this.position.y > b) {
            this.position.y = b;
            this.velocity.y *= -1;
            this.moving = true;
        }
    }

    // apply friction scaled by dt (apply once per frame after all substeps)
    applyFrictionScaled(dt) {
        if (this.inHole) return;
        // scale per-second friction to this dt: factor = FRIC_PER_SEC^(dt)
        const factor = Math.pow(FRIC_PER_SEC, dt * 60); // 60 is arbitrary baseline to make tuning intuitive
        this.velocity.multiplyWith(factor);

        // stop threshold (magnitude)
        const speedSq = this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y;
        if (speedSq < STOP_T * STOP_T) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.moving = false;
        } else {
            this.moving = true;
        }
    }

    draw() {
        if (!this.visible) return;
        Canvas2D.drawImage(this.sprite, this.position, 0, 1, this.origin);
    }
}
