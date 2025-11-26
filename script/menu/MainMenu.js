
// script/menu/MainMenu.js
import Menu from "./Menu.js";
import Vector2 from "../geom/Vector2.js";
import Button from "./Button.js";
import Label from "./Label.js";
import { sprites } from "../Assets.js";

// import Menu from "./Menu.js";
// import Vector2 from "../geom/Vector2.js";
// import Button from "./Button.js";
// import Label from "./Label.js";
import Canvas2D from "../Canvas2D.js";
// import { sprites } from "../Assets.js";


export default class MainMenu extends Menu {
    constructor(game) {
        super(game);
    }

    build() {
        const centerX = 750; // middle of 1500px width

        const labels = [
            new Label(
                "Classic 8-Ball",
                new Vector2(centerX, 150),
                new Vector2(0, 0),
                "#ffffff",
                "center",
                "Impact",
                "80px"
            )
        ];

        const buttons = [
            new Button(
                sprites.onePlayersButton,
                sprites.onePlayersButtonHover,
                new Vector2(centerX - sprites.onePlayersButton.width / 2, 300),
                () => this.game.changeState(this.game.states.GAME)
            ),

            new Button(
                sprites.twoPlayersButton,
                sprites.twoPlayersButtonHover,
                new Vector2(centerX - sprites.twoPlayersButton.width / 2, 450),
                () => this.game.changeState(this.game.states.GAME)
            )
        ];

        super.build(labels, buttons);
    }
     draw() {
        if (!this.visible) return;

        const bg = sprites.mainMenuBackground;
        if (bg) {

            Canvas2D.drawImage(
                bg,
                new Vector2(bg.width/2, bg.height/2),
                0,
                1,
                new Vector2(bg.width/2, bg.height/2)
            );
        } else {
            console.warn("Background NOT loaded!");
        }

        // Draw UI elements
        super.draw();
    }
}


// // script/menu/MainMenu.js
// import Menu from "./Menu.js";
// import Vector2 from "../geom/Vector2.js";
// import Button from "./Button.js";
// import Label from "./Label.js";
// import Canvas2D from "../Canvas2D.js";
// import { sprites } from "../Assets.js";

// export default class MainMenu extends Menu {
//     constructor(game) {
//         super(game);
//     }

//     build() {

//         console.log("BG sprite:", sprites.mainMenuBackground); // DEBUG

//         const labels = [
//             new Label(
//                 "Classic 8-Ball",
//                 new Vector2(750, 140),
//                 new Vector2(0, 0),
//                 "#ffffff",
//                 "center",
//                 "Impact",
//                 "70px"
//             )
//         ];

//         const buttons = [
//             new Button(
//                 sprites.onePlayersButton,
//                 sprites.onePlayersButtonHover,
//                 new Vector2(600, 300),
//                 () => this.game.changeState(this.game.states.GAME)
//             ),
//             new Button(
//                 sprites.twoPlayersButton,
//                 sprites.twoPlayersButtonHover,
//                 new Vector2(600, 400),
//                 () => this.game.changeState(this.game.states.GAME)
//             )
//         ];

//         super.build(labels, buttons);
//     }

   
// }

