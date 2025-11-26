// script/game_objects/Stick.js
import Vector2 from "../geom/Vector2.js";
import Canvas2D from "../Canvas2D.js";
import { sprites, sounds } from "../Assets.js";
import Mouse from "../input/Mouse.js";
import Keyboard from "../input/Keyboard.js";

export default class Stick {
  constructor(position){
    this.position = position.clone ? position.clone() : { x: position.x, y: position.y };
    this.origin = { x: 970, y: 11 };
    this.shotOrigin = { x: 950, y: 11 };
    this.rotation = 0;
    this.power = 0;
    this.shooting = false;
    this.visible = true;
    this.trackMouse = true;
  }

  handleInput(delta, world){
    const game = world.game;
    if (game.AI_ON && world.policy.turn === game.AI_PLAYER_NUM) return;
    if (world.policy.turnPlayed) return;

    // keyboard power (W up, S down) — fallback keys names
    if (Keyboard.isDown('KeyW') && game.KEYBOARD_INPUT_ON){
      if (this.power < 75){ this.origin.x += 2; this.power += 1.2; }
    }
    if (Keyboard.isDown('KeyS') && game.KEYBOARD_INPUT_ON){
      if (this.power > 0){ this.origin.x -= 2; this.power -= 1.2; }
    }

    // shoot with mouse: left down triggers shoot when power > 0
    if (this.power > 0 && Mouse.left.down){
      // play strike
      try { if (sounds.strike) sounds.strike.cloneNode(true).play(); } catch(e){}
      world.policy.turnPlayed = true;
      world.policy.foul = false;
      this.shooting = true;
      this.origin = { ...this.shotOrigin };
      world.whiteBall.shoot(this.power, this.rotation);
      const stick = this;
      setTimeout(()=> stick.visible = false, 500);
      return;
    }

    // track mouse for rotation
    if (this.trackMouse){
      const op = Mouse.position.y - this.position.y;
      const adj = Mouse.position.x - this.position.x;
      this.rotation = Math.atan2(op, adj);
    }
  }

  update(delta, world){
    // reset after shot once ball stops
    if (this.shooting && !world.whiteBall.moving){
      this.reset(world);
    }
    // keep stick anchored to white ball
    this.position.x = world.whiteBall.position.x;
    this.position.y = world.whiteBall.position.y;
  }

  reset(world){
    this.position.x = world.whiteBall.position.x;
    this.position.y = world.whiteBall.position.y;
    this.origin = { x: 970, y: 11 };
    this.shooting = false;
    this.visible = true;
    this.power = 0;
  }

  draw(){
    if (!this.visible) return;
    Canvas2D.drawImage(sprites.stick, { x: this.position.x, y: this.position.y }, this.rotation, 1, { x: this.origin.x, y: this.origin.y });
  }
}
