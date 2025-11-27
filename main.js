// main.js
import Game from './script/Game.js';
import { loadAssets } from './script/Assets.js';
import Canvas2D from './script/Canvas2D.js';
import Mouse from "./script/input/Mouse.js";

(async function main() {
  try {
    await loadAssets();

    const game = new Game();
    await game.start("gameArea", "screen", 1500, 825);

    // Canvas exists now
    const canvas = Canvas2D.canvas;

    if (!canvas) {
      console.error("Canvas2D.canvas is null after initialization!");
      return;
    }



    Mouse.attach(canvas);



    // vvv



    canvas.addEventListener("mousemove", (e) => {
        const r = canvas.getBoundingClientRect();
        Mouse.position.x = e.clientX - r.left;
        Mouse.position.y = e.clientY - r.top;

        game.gsm.handleMouseMove(Mouse.position.x, Mouse.position.y);
    });
    canvas.addEventListener("mousedown", (e) => {
        if (e.button === 0) {
            Mouse.left.pressed = true;
            game.gsm.handleMouseDown();
        }
    });

    canvas.addEventListener("mouseup", (e) => {
        if (e.button === 0) {
            Mouse.left.pressed = false;
            Mouse.left.released = true;
            game.gsm.handleMouseUp();
        }
    });

        //--------------------------------------------------
    // 1️⃣ Mouse position tracking
    //--------------------------------------------------
    // canvas.addEventListener("mousemove", (e) => {
    //     const rect = canvas.getBoundingClientRect();
    //     Mouse.position.x = e.clientX - rect.left;          
    //     Mouse.position.y = e.clientY - rect.top;

    //     if (game.gsm) {
    //         game.gsm.handleMouseMove(Mouse.position.x, Mouse.position.y);
    //     }
    // });

    //--------------------------------------------------
    // 2️⃣ Mouse click handling
    //--------------------------------------------------
    // canvas.addEventListener("click", (e) => {
    //     const rect = canvas.getBoundingClientRect();
    //     const x = e.clientX - rect.left;
    //     const y = e.clientY - rect.top;

    //     Mouse.left.pressed = true;

    //     if (game.gsm) {
    //         game.gsm.handleClick(x, y);
    //     }
    // });

    console.log("Game started");
    window.__GAME = game;

  } catch (err) {
    console.error("Bootstrap error:", err);
  }
})();
