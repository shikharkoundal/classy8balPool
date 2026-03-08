import Canvas2D from "../core/Canvas2D.js";

export default class MenuBall {

  constructor(x,y,radius,sprite){

    this.x = x;
    this.y = y;

    this.radius = radius;
    this.sprite = sprite;

    this.vx = (Math.random()-0.5) * 40;
    this.vy = (Math.random()-0.5) * 40;

  }

  update(dt){

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const canvas = Canvas2D.canvas;

    if(this.x < this.radius || this.x > canvas.width - this.radius){
      this.vx *= -1;
    }

    if(this.y < this.radius || this.y > canvas.height - this.radius){
      this.vy *= -1;
    }

  }

  render(){

    const ctx = Canvas2D.ctx;

    if(this.sprite){

      ctx.drawImage(
        this.sprite,
        this.x - this.radius,
        this.y - this.radius,
        this.radius*2,
        this.radius*2
      );

    }

  }

}