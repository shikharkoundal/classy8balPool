import Canvas2D from "../core/Canvas2D.js";
import { sprites } from "../Assets.js";
import Button from "../core/Button.js";
import GameplayState from "GameplayState.js";


import MenuBall from "../game/MenuBall.js";
export default class MainMenuState {

  constructor(manager) {

    this.manager = manager;

    this.buttons = [];

    this.mouse = { x:0, y:0 };
    this.menuBalls = [];
  }

  enter() {

    const canvas = Canvas2D.canvas;

    this.buttons = [

      new Button(
        350,
        260,
        300,
        80,
        sprites.onePlayersButton,
        sprites.onePlayersButtonHover,
        () => {

          console.log("1 PLAYER CLICKED");

          this.manager.changeState(
            new GameplayState(this.manager,"ai")
          );

        }
      ),

      new Button(
        350,
        360,
        300,
        80,
        sprites.twoPlayersButton,
        sprites.twoPlayersButtonHover,
        // () => {

        //   this.manager.changeState(
        //     new GameplayState(this.manager,"pvp")
        //   );

        // }

        () => {

  console.log("1 PLAYER CLICKED");

  this.manager.changeState(
    new GameplayState(this.manager,"ai")
  );

}
      )
    ];

    this.menuBalls = [

  new MenuBall(200,200,25,sprites.spr_red),
  new MenuBall(700,300,25,sprites.spr_yellow),
  new MenuBall(500,450,25,sprites.spr_black)

];

    canvas.addEventListener(
      "mousemove",
      this.mouseMove = (e)=>{

        const rect = canvas.getBoundingClientRect();

        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

      }
    );

    canvas.addEventListener(
      "mousedown",
      this.mouseDown = ()=>{

        for (const b of this.buttons) {
          b.handleClick(this.mouse.x,this.mouse.y);
        }

      }
    );
  }

  exit() {

    const canvas = Canvas2D.canvas;

    canvas.removeEventListener("mousemove",this.mouseMove);
    canvas.removeEventListener("mousedown",this.mouseDown);
  }

update(dt) {
// console.log("menu updating");
  // update button hover
  for (const b of this.buttons) {
    b.update(this.mouse.x,this.mouse.y);
  }

  // animate background balls
  for (const ball of this.menuBalls) {
    ball.update(dt);
  }

}

render() {

  const ctx = Canvas2D.ctx;

  ctx.clearRect(
    0,
    0,
    Canvas2D.canvas.width,
    Canvas2D.canvas.height
  );

  /* BACKGROUND */

  if (sprites.mainMenuBackground) {

    ctx.drawImage(
      sprites.mainMenuBackground,
      0,
      0,
      1000,
      600
    );

  } else {

    ctx.fillStyle = "#111";
    ctx.fillRect(0,0,1000,600);

  }

  /* TITLE */

  ctx.fillStyle = "white";
  ctx.font = "64px Arial";
  ctx.textAlign = "center";

  ctx.fillText(
    "POOL MASTER",
    Canvas2D.canvas.width / 2,
    160
  );

  /* BUTTONS */

  for (const b of this.buttons) {
    b.render(ctx);
  }

  /* ANIMATED BALLS (draw last so they are visible) */

  for (const ball of this.menuBalls){
    ball.render();
  }

}

}