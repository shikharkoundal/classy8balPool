// script/game/GameWorld.js
import Canvas2D from "../Canvas2D.js";
import { sprites } from "../Assets.js";
import Ball       from "../game_objects/Ball.js";
import Stick      from "../game_objects/Stick.js";
import GamePolicy from "../GamePolicy.js";
import { resolveBallCollision } from "../physics/BallPhysics.js";

export default class GameWorld {
    constructor(game) {

        this.game = game;

        // example setup:
        this.balls = [
            new Ball(new Vector2(400,400), sprites.ball),
            new Ball(new Vector2(600,420), sprites.spr_red),
            // add all balls...
        ];

        this.stick  = new Stick({x:400, y:400});
        this.policy = new GamePolicy(this);
    }

    handleInput(dt) {
        this.stick.update(dt, this);
    }

    update(dt) {

        //-------------------------------------------------------
        // 1) Predict (no movement applied yet)
        //-------------------------------------------------------
        for (const b of this.balls)
            b.predict(dt);

        //-------------------------------------------------------
        // 2) Collision pass (using PREDICTED nextPos)
        //-------------------------------------------------------
        for (let i=0; i<this.balls.length; i++){
            for (let j=i+1; j<this.balls.length; j++){
                resolveBallCollision(this.balls[i], this.balls[j]);
            }
        }

        //-------------------------------------------------------
        // 3) Integrate (commit nextPos → position)
        //-------------------------------------------------------
        for (const b of this.balls)
            b.integrate();

        //-------------------------------------------------------
        // 4) Friction
        //-------------------------------------------------------
        for (const b of this.balls)
            b.applyFriction();

        //-------------------------------------------------------
        // 5) Border bounce (AFTER integration)
        //-------------------------------------------------------
        for (const b of this.balls)
            b.borderBounce(this.policy);
    }

    draw() {
        Canvas2D.drawImage(sprites.background);
        for (const b of this.balls) b.draw();
        this.stick.draw();
    }
}
