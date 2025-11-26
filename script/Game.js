// script/Game.js
import Ball from "./game_objects/Ball.js";
import Vector2 from "./geom/Vector2.js";
import Canvas2D from "./Canvas2D.js";
import GamePolicy from "./GamePolicy.js";
import { sprites } from "./Assets.js";
import { collideBalls } from "./physics/BallCollision.js";

export default class Game {
    constructor() {
        this.size = new Vector2(1500, 825);

        this.ballA = null;
        this.ballB = null;

        this.world = null;
        this.lastTime = 0;

        // Substeps per frame to avoid tunneling
        this.SUBSTEPS = 4;
    }

    async start(divName, canvasName, w, h) {
        console.log("Game started");

        this.size = new Vector2(w, h);
        Canvas2D.setGameSize(this.size);
        Canvas2D.initialize(divName, canvasName);

        await new Promise(r => requestAnimationFrame(r));

        // policy
        this.world = { policy: new GamePolicy(this) };

        // create two balls
        this.ballA = new Ball(new Vector2(600, 400), sprites.ball);
        this.ballB = new Ball(new Vector2(850, 400), sprites.ball);

        // shoot A toward B
        this.ballA.shoot(3000, 0);

        this.lastTime = performance.now();
        requestAnimationFrame(ts => this._loop(ts));
    }

    _loop(t) {
        const dt = (t - this.lastTime) / 1000;
        this.lastTime = t;

        // clamp dt to avoid huge jumps (safety)
        const maxDt = 0.05;
        const frameDt = Math.min(dt, maxDt);

        Canvas2D.clear();

        // Substeps: move, resolve collisions & borders
        const steps = this.SUBSTEPS;
        const subdt = frameDt / steps;

        for (let i = 0; i < steps; i++) {
            // integrate positions for each ball
            this.ballA.integratePosition(subdt);
            this.ballB.integratePosition(subdt);

            // ball-ball collision
            collideBalls(this.ballA, this.ballB);

            // borders (after collision)
            this.ballA.borderBounce(this.world.policy);
            this.ballB.borderBounce(this.world.policy);
        }

        // apply friction once per frame (scaled by frame dt)
        this.ballA.applyFrictionScaled(frameDt);
        this.ballB.applyFrictionScaled(frameDt);

        // draw
        this.ballA.draw();
        this.ballB.draw();

        requestAnimationFrame(ts => this._loop(ts));
    }
}
