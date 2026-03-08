import Canvas2D from "../core/Canvas2D.js";
import { loadAssets } from "../Assets.js";
import LaunchState from "./LaunchState.js";

export default class LoadingState {

  constructor(manager){
    this.manager = manager;
    this.progress = 0;
  }

  async enter(){

    // simulate progress
    const interval = setInterval(()=>{
      this.progress += 0.05;
      if(this.progress >= 1){
        clearInterval(interval);
      }
    },50);

    // load assets
    await loadAssets();

    // small delay so player sees loading
    setTimeout(()=>{
      this.manager.changeState(
        new LaunchState(this.manager)
      );
    },800);

  }

  update(){}

  render(){

    const ctx = Canvas2D.ctx;

    ctx.clearRect(
      0,
      0,
      Canvas2D.canvas.width,
      Canvas2D.canvas.height
    );

    ctx.fillStyle="#000";
    ctx.fillRect(0,0,1000,600);

    ctx.fillStyle="white";
    ctx.font="40px Arial";
    ctx.textAlign="center";

    ctx.fillText(
      "LOADING...",
      500,
      260
    );

    // progress bar background
    ctx.fillStyle="#333";
    ctx.fillRect(300,300,400,20);

    // progress fill
    ctx.fillStyle="#4CAF50";
    ctx.fillRect(
      300,
      300,
      400*this.progress,
      20
    );

  }

}