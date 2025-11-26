// script/Game.js
import Ball from "./game_objects/Ball.js";
import Vector2 from "./geom/Vector2.js";
import Canvas2D from "./Canvas2D.js";
import GamePolicy from "./GamePolicy.js";
import { sprites } from "./Assets.js";

export default class Game {
    constructor() {
        this.size = new Vector2(1500, 825);
        this.world = null;
        this.testBall = null;
        this.lastTime = 0;
    }

    async start(divName, canvasName, w, h) {
        console.log("Game started");

        this.size = new Vector2(w, h);
        Canvas2D.setGameSize(this.size);
        Canvas2D.initialize(divName, canvasName);

        await new Promise(r => requestAnimationFrame(r));

        // policy (borders)
        this.world = { policy: new GamePolicy(this) };

        // SINGLE TEST BALL
        this.testBall = new Ball(new Vector2(300, 300), sprites.ball);
        this.testBall.shoot(3000, Math.PI / 4);

        this.lastTime = performance.now();
        requestAnimationFrame(ts => this._loop(ts));
    }

    _loop(t) {
        const dt = (t - this.lastTime) / 1000;
        this.lastTime = t;

        Canvas2D.clear();

        this.testBall.update(dt, this.world);
        this.testBall.draw();

        requestAnimationFrame(ts => this._loop(ts));
    }
}
