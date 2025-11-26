// script/game_objects/Ball.js
import Vector2 from "../geom/Vector2.js";
import Canvas2D from "../Canvas2D.js";
import { sprites } from "../Assets.js";

export const BALL_DIAMETER = 37;
export const BALL_RADIUS = BALL_DIAMETER / 2;

const FRICTION = 0.992;
const STOP_T = 0.035;

export default class Ball {
    constructor(position, colorSprite = sprites.ball) {

        this.position = position.clone();       // actual
        this.nextPos  = position.clone();       // predicted

        this.velocity = new Vector2(0,0);

        this.radius   = BALL_RADIUS;
        this.moving   = false;
        this.visible  = true;
        this.inHole   = false;

        this.origin   = new Vector2(BALL_RADIUS, BALL_RADIUS);
        this.sprite   = colorSprite;
    }

    shoot(power, angle) {
        const speed = power * 0.9;
        this.velocity.x = Math.cos(angle) * speed;
        this.velocity.y = Math.sin(angle) * speed;
        this.moving = true;
    }

    // (1) Predict
    predict(dt) {
        if (!this.moving || this.inHole) {
            this.nextPos.copyFrom(this.position);
            return;
        }
        this.nextPos.x = this.position.x + this.velocity.x * dt;
        this.nextPos.y = this.position.y + this.velocity.y * dt;
    }

    // (3) Integrate
    integrate() {
        if (!this.moving || this.inHole) return;
        this.position.copyFrom(this.nextPos);
    }

    // (4) Friction + stop logic
    applyFriction() {
        if (this.inHole) return;

        this.velocity.multiplyWith(FRICTION);

        if (Math.abs(this.velocity.x) < STOP_T &&
            Math.abs(this.velocity.y) < STOP_T) {

            this.moving = false;
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
    }

    // (5) Border bounce AFTER integrate
    borderBounce(policy) {
        if (!this.moving || this.inHole) return;

        const l = policy.leftBorderX  + this.radius;
        const r = policy.rightBorderX - this.radius;
        const t = policy.topBorderY   + this.radius;
        const b = policy.bottomBorderY - this.radius;

        // X
        if (this.position.x < l) {
            this.position.x = l;
            this.velocity.x *= -1;
        } else if (this.position.x > r) {
            this.position.x = r;
            this.velocity.x *= -1;
        }

        // Y
        if (this.position.y < t) {
            this.position.y = t;
            this.velocity.y *= -1;
        } else if (this.position.y > b) {
            this.position.y = b;
            this.velocity.y *= -1;
        }
    }

    draw() {
        if (this.visible)
            Canvas2D.drawImage(this.sprite, this.position, 0, 1, this.origin);
    }
}
