import Canvas2D from "../Canvas2D.js";
import { sprites } from "../Assets.js";
import Vector2 from "../geom/Vector2.js";
// import { sprites } from "../Assets.js";
import Button from "../menu/Button.js";

export default class MainMenuState {
    constructor(game, gsm) {
        this.game = game;
        this.gsm = gsm;

        // button positions
        this.oneBtn = {
            pos: new Vector2(500, 350),
            w: 496,
            h: 129,
            hover: false
        };

        this.twoBtn = {
            pos: new Vector2(500, 500),
            w: 496,
            h: 129,
            hover: false
        };
    }
    
    onEnter() {
        console.log("Entered Main Menu");

        this.buttons = [
            new Button(
                sprites.onePlayersButton,
                sprites.onePlayersButtonHover,
                new Vector2(500, 300),
                () => {
                    console.log("1 Player clicked");
                    this.gsm.changeState(this.game.gameplayState);
                }
            ),
            new Button(
                sprites.twoPlayersButton,
                sprites.twoPlayersButtonHover,
                new Vector2(500, 450),
                () => {
                    console.log("2 Player clicked");
                    this.gsm.changeState(this.game.gameplayState);
                }
            )
        ];
    }
    update(dt) {}

    draw() {
        // Canvas2D.clear();

        // // draw background
        // Canvas2D.drawImage(sprites.mainMenuBackground, new Vector2(0, 0), 0, 1, Vector2.zero);

        // draw ONE PLAYER button
       Canvas2D.clear();
        Canvas2D.drawImage(sprites.mainMenuBackground, new Vector2(0,0));

        for (const btn of this.buttons) btn.draw();
    }

    handleMouseMove(x, y) {
        this.oneBtn.hover = this._hit(this.oneBtn, x, y);
        this.twoBtn.hover = this._hit(this.twoBtn, x, y);
    }
    handleMouseDown() {
        for (const btn of this.buttons) btn.handleInput();
    }

    handleClick(x, y) {
        if (this._hit(this.oneBtn, x, y)) {
            console.log("1 Player clicked");
            this.gsm.changeState(this.game.gameplayState);
        }

        if (this._hit(this.twoBtn, x, y)) {
            console.log("2 Player clicked");
            this.gsm.changeState(this.game.gameplayState); // same for now
        }
    }

    _hit(btn, mx, my) {
        return (
            mx >= btn.pos.x &&
            mx <= btn.pos.x + btn.w &&
            my >= btn.pos.y &&
            my <= btn.pos.y + btn.h
        );
    }
}
