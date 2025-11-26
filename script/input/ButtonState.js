// script/input/ButtonState.js
// Minimal button state for keyboard/mouse buttons

export default class ButtonState {
  constructor() {
    this.down = false;     // currently held
    this.pressed = false;  // went down this tick
    this.released = false; // went up this tick
  }

  // mark the button as down/up (called from event handlers)
  setDown(isDown) {
    if (isDown && !this.down) {
      this.pressed = true;
      this.released = false;
    } else if (!isDown && this.down) {
      this.released = true;
      this.pressed = false;
    } else {
      // no change
      this.pressed = false;
      this.released = false;
    }
    this.down = isDown;
  }

  // consume per-frame edge states
  resetTick() {
    this.pressed = false;
    this.released = false;
  }
}
