// script/game_objects/Ball.js
import Vector2 from "../geom/Vector2.js";
import Canvas2D from "../Canvas2D.js";
import { sprites } from "../Assets.js";

export const BALL_DIAMETER = 50;
export const BALL_RADIUS = BALL_DIAMETER / 2;

// friction per second (multiplicative)
const FRIC_PER_SEC = 0.98;
const HARD_STOP_SPEED_SQ = 1; // if speed^2 below this -> force stop

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

        // needed for pocket animation
        this.scale = 1;
        this.isAnimating = false;
        this.removeMe = false;
        this.isCueBall = false;
    }

    shoot(power, angle) {
        // tuned speed
        const speed = power * 0.3;
        this.velocity.x = Math.cos(angle) * speed;
        this.velocity.y = Math.sin(angle) * speed;
        this.moving = true;
    }

    integratePosition(dt) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }

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

    applyFrictionScaled(dt) {
        // do nothing for pocketed/animating balls
        if (this.inHole || this.isAnimating) return;

        // apply multiplicative friction scaled to dt
        const factor = Math.pow(FRIC_PER_SEC, dt * 60);
        // Vector2 has multiplyWith in your repo — but remain safe and update components directly:
        if (typeof this.velocity.multiplyWith === "function") {
            this.velocity.multiplyWith(factor);
        } else {
            this.velocity.x *= factor;
            this.velocity.y *= factor;
        }

        // hard stop: if speed small enough, set exact zero to avoid eternal tiny velocities
        const speedSq = this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y;
        if (speedSq < HARD_STOP_SPEED_SQ) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.moving = false;
            return;
        }

        // otherwise still moving
        this.moving = true;
    }

    draw() {
        if (!this.visible) return;

        Canvas2D.drawImage(
            this.sprite,
            this.position,
            0,
            this.scale,
            this.origin
        );
    }
}
