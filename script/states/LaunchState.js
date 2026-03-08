import Canvas2D from "../core/Canvas2D.js";
import MainMenuState from "MainMenuState.js";

export default class LaunchState {

  constructor(manager) {
    this.manager = manager;
    this.timer = 0;
  }

  update(dt) {
    this.timer += dt;

    if (this.timer > 2) {
      this.manager.changeState(
        new MainMenuState(this.manager)
      );
    }
  }

  render() {

    const ctx = Canvas2D.ctx;

    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,1000,600);

    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      "POOL MASTER",
      500,
      300
    );
  }
}