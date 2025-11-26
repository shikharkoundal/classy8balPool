// script/AI/Opponent.js
// Simple data-holder for a candidate shot

export default class Opponent {
  constructor(power = null, rotation = null) {
    // Random defaults taken from original implementation:
    // power: (Math.random() * 75 + 1)
    // rotation: (Math.random()*6.283)-3.141
    this.power = power !== null ? power : Math.random() * 75 + 1;
    this.rotation = rotation !== null ? rotation : Math.random() * 2 * Math.PI - Math.PI;
    this.evaluation = 0;
  }
}
