// script/game_objects/Ball.js
import Vector2 from "../geom/Vector2.js";
import Canvas2D from "../Canvas2D.js";
import { sprites } from "../Assets.js";

export const BALL_DIAMETER = 50;
export const BALL_RADIUS = BALL_DIAMETER / 2;

const FRICTION = 0.99;
const STOP_T = 0.02;

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
        const speed = power * 0.3; // tune speed scale
        this.velocity.x = Math.cos(angle) * speed;
        this.velocity.y = Math.sin(angle) * speed;
        this.moving = true;
    }

    update(dt, world) {
        if (!this.moving || this.inHole) return;

        let nx = this.position.x + this.velocity.x * dt;
        let ny = this.position.y + this.velocity.y * dt;

        const policy = world && world.policy ? world.policy : {
            leftBorderX: 20,
            rightBorderX: 1480,
            topBorderY: 20,
            bottomBorderY: 800
        };

        // --- BORDERS ---
        if (nx < policy.leftBorderX + this.radius) {
            nx = policy.leftBorderX + this.radius;
            this.velocity.x *= -1;
        } else if (nx > policy.rightBorderX - this.radius) {
            nx = policy.rightBorderX - this.radius;
            this.velocity.x *= -1;
        }

        if (ny < policy.topBorderY + this.radius) {
            ny = policy.topBorderY + this.radius;
            this.velocity.y *= -1;
        } else if (ny > policy.bottomBorderY - this.radius) {
            ny = policy.bottomBorderY - this.radius;
            this.velocity.y *= -1;
        }

        this.position.x = nx;
        this.position.y = ny;

        // --- FRICTION ---
        this.velocity.multiplyWith(FRICTION);

        // --- STOP CHECK ---
        if (
            Math.abs(this.velocity.x) < STOP_T &&
            Math.abs(this.velocity.y) < STOP_T
        ) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.moving = false;
        }
    }

    draw() {
        if (this.visible)
            Canvas2D.drawImage(this.sprite, this.position, 0, 1, this.origin);
    }
}
