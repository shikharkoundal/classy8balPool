// script/states/MainMenuState.js

import Canvas2D from "../Canvas2D.js";
import { sprites } from "../Assets.js";
import Vector2 from "../geom/Vector2.js";
import Button from "../menu/Button.js";

export default class MainMenuState {
    constructor(game, gsm) {
        this.game = game;
        this.gsm = gsm;
    }

    onEnter() {
        console.log("Entered Main Menu");

        this.buttons = [
            new Button(
                sprites.onePlayersButton,
                sprites.onePlayersButtonHover,
                new Vector2(500, 300),
                () => {
                    console.log("1 Player (Practice) clicked");
                    this.game.mode = "practice";
                    this.gsm.changeState(this.game.gameplayState);
                }
            ),
            new Button(
                sprites.twoPlayersButton,
                sprites.twoPlayersButtonHover,
                new Vector2(500, 450),
                () => {
                    console.log("2 Player (Match) clicked");
                    this.game.mode = "match";
                    this.gsm.changeState(this.game.gameplayState);
                }
            )
        ];
    }
    update(dt) {}

    draw() {
        Canvas2D.clear();
        Canvas2D.drawImage(sprites.mainMenuBackground, new Vector2(0,0));

        for (const btn of this.buttons) btn.draw();
    }

    handleMouseMove(x, y) {
        // Button hover handled by Button.isHovered which reads Mouse.position.
        // But to be safe, we can forward move to each button by simulating Mouse position update.
        for (const btn of this.buttons) {
            // nothing needed — Button.isHovered reads global Mouse
        }
    }

    handleMouseDown() {
        for (const btn of this.buttons) btn.handleInput();
    }

    handleClick(x, y) {
        // fallback click handling (not necessary if button handles mousedown)
        // Retained for compatibility
        if (x >= 500 && x <= 500 + sprites.onePlayersButton.width &&
            y >= 300 && y <= 300 + sprites.onePlayersButton.height) {
            this.game.mode = "practice";
            this.gsm.changeState(this.game.gameplayState);
        }
        if (x >= 500 && x <= 500 + sprites.twoPlayersButton.width &&
            y >= 450 && y <= 450 + sprites.twoPlayersButton.height) {
            this.game.mode = "match";
            this.gsm.changeState(this.game.gameplayState);
        }
    }
}
