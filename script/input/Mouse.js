// script/input/Mouse.js
// returns positions in game coordinates (Canvas2D scale-aware)

import Canvas2D from "../Canvas2D.js";
import Vector2 from "../geom/Vector2.js";
import ButtonState from "./ButtonState.js";

const position = new Vector2(0,0);
const left = new ButtonState();
const right = new ButtonState();

function _getCanvasRelativePosition(e) {
  const canvas = Canvas2D._canvas;
  if (!canvas) return { x: e.clientX, y: e.clientY };

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const sc = Canvas2D.scale;
  if (sc && sc.x !== 0 && sc.y !== 0) {
    return { x: x / sc.x, y: y / sc.y };
  }
  return { x, y };
}

window.addEventListener('mousemove', (e) => {
  const p = _getCanvasRelativePosition(e);
  position.x = p.x;
  position.y = p.y;
});

window.addEventListener('mousedown', (e) => {
  if (e.button === 0) left.setDown(true);
  if (e.button === 2) right.setDown(true);
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 0) left.setDown(false);
  if (e.button === 2) right.setDown(false);
});

// prevent context menu on right click
window.addEventListener('contextmenu', (e) => e.preventDefault());

export default {
  position,
  left,
  right,
  reset() {
    left.resetTick();
    right.resetTick();
  }
};
