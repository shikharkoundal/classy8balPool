// script/Canvas2D.js
import Vector2 from './geom/Vector2.js';

class Canvas2D {
  constructor() {
    this._canvas = null;
    this._ctx = null;
    this._div = null;
    this._gameSize = new Vector2(1500, 825);
    this._offset = new Vector2(0,0);
  }

  setGameSize(sizeVector) {
    if (!sizeVector || !sizeVector.x) throw new Error('setGameSize expects Vector2');
    this._gameSize = sizeVector.clone();
  }

  initialize(divName, canvasName) {
    this._canvas = document.getElementById(canvasName);
    this._div = document.getElementById(divName);
    if (!this._canvas) throw new Error('Canvas element not found: ' + canvasName);
    const ctx = this._canvas.getContext('2d');
    if (!ctx) throw new Error('2D context not supported');
    this._ctx = ctx;
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    if (!this._canvas || !this._div) return;
    const widthToHeight = this._gameSize.x / this._gameSize.y;
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;
    const newWidthToHeight = newWidth / newHeight;
    if (newWidthToHeight > widthToHeight) newWidth = newHeight * widthToHeight;
    else newHeight = newWidth / widthToHeight;
    this._div.style.width = newWidth + 'px';
    this._div.style.height = newHeight + 'px';
    this._div.style.marginTop = ((window.innerHeight - newHeight) / 2) + 'px';
    this._canvas.width = newWidth;
    this._canvas.height = newHeight;

    // calculate canvas offset for mouse mapping
    const rect = this._canvas.getBoundingClientRect();
    this._offset.x = rect.left;
    this._offset.y = rect.top;
  }

  get scale() {
    return new Vector2(this._canvas.width / this._gameSize.x, this._canvas.height / this._gameSize.y);
  }

  clear() {
    this._ctx.clearRect(0,0,this._canvas.width,this._canvas.height);
  }

  setCursor(cursor) {
    if (this._canvas) this._canvas.style.cursor = cursor;
  }

  drawImage(sprite, position = Vector2.zero, rotation = 0, scale = 1, origin = Vector2.zero) {
    if (!sprite) return;
    const sc = this.scale;
    this._ctx.save();
    this._ctx.scale(sc.x, sc.y);
    this._ctx.translate(position.x, position.y);
    this._ctx.rotate(rotation);
    this._ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height, -origin.x * scale, -origin.y * scale, sprite.width * scale, sprite.height * scale);
    this._ctx.restore();
  }

  drawText(text, position = Vector2.zero, origin = Vector2.zero, color = '#000', textAlign = 'left', fontname = 'sans-serif', fontsize = '20px') {
    const sc = this.scale;
    this._ctx.save();
    this._ctx.scale(sc.x, sc.y);
    this._ctx.translate(position.x - origin.x, position.y - origin.y);
    this._ctx.textBaseline = 'top';
    this._ctx.font = `${fontsize} ${fontname}`;
    this._ctx.fillStyle = color;
    this._ctx.textAlign = textAlign;
    this._ctx.fillText(text, 0, 0);
    this._ctx.restore();
  }
}

export default new Canvas2D();
