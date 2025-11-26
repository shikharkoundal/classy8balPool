// script/input/Keyboard.js
// A tiny keyboard adapter — provides isDown(code) and reset()

import ButtonState from "./ButtonState.js";

class Keyboard {
  constructor() {
    this.keys = {}; // map code -> ButtonState

    // keep common keys ready (add more if you need)
    const common = ['KeyW','KeyS','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'];
    common.forEach(k => this.keys[k] = new ButtonState());

    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) this.keys[e.code] = new ButtonState();
      this.keys[e.code].setDown(true);
    }, false);

    window.addEventListener('keyup', (e) => {
      if (!this.keys[e.code]) this.keys[e.code] = new ButtonState();
      this.keys[e.code].setDown(false);
    }, false);
  }

  isDown(code) {
    const k = this.keys[code];
    return !!(k && k.down);
  }

  wasPressed(code) {
    const k = this.keys[code];
    return !!(k && k.pressed);
  }

  reset() {
    for (const k in this.keys) {
      this.keys[k].resetTick();
    }
  }
}

export default new Keyboard();
