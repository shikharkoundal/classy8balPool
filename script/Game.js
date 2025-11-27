import Canvas2D from "./Canvas2D.js";
import Vector2 from "./geom/Vector2.js";
import GameStateManager from "./GameStateManager.js";
import MainMenuState from "./states/MainMenuState.js";
import GameplayState from "./states/GameplayState.js";
import Ball from "./game_objects/Ball.js";

export default class Game {
    constructor() {
        this.size = new Vector2(1500, 825);

        // Correct GSM initialization
        this.gsm = new GameStateManager(this);
    }

    async start(divName, canvasName, w, h) {
        console.log("Game started");

        this.size = new Vector2(w, h);

        Canvas2D.setGameSize(this.size);
        Canvas2D.initialize(divName, canvasName);

        await new Promise(r => requestAnimationFrame(r));

        // Create states
        this.mainMenuState = new MainMenuState(this, this.gsm);
        this.gameplayState = new GameplayState(this, this.gsm);

        // Start in menu
        this.gsm.changeState(this.mainMenuState);

        this.lastTime = performance.now();
        requestAnimationFrame(ts => this._loop(ts));
    }

    // ⭐ This is what GameplayState is calling
    createBall(x, y) {
        return new Ball(new Vector2(x, y));
    }

    _loop(t) {
        const dt = (t - this.lastTime) / 1000;
        this.lastTime = t;

        this.gsm.update(dt);
        this.gsm.draw();

        requestAnimationFrame(ts => this._loop(ts));
    }
}
