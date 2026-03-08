export default class Button {

  constructor(x, y, width, height, sprite, hoverSprite, onClick) {

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.sprite = sprite;
    this.hoverSprite = hoverSprite;

    this.onClick = onClick;

    this.hover = false;

  }

  update(mouseX, mouseY) {

    this.hover =
      mouseX >= this.x &&
      mouseX <= this.x + this.width &&
      mouseY >= this.y &&
      mouseY <= this.y + this.height;

  }

  handleClick(mouseX, mouseY) {

    if (
      mouseX >= this.x &&
      mouseX <= this.x + this.width &&
      mouseY >= this.y &&
      mouseY <= this.y + this.height
    ) {
      if (this.onClick) {
        this.onClick();
      }
    }

  }

  render(ctx) {

    const img = this.hover ? this.hoverSprite : this.sprite;

    if (img) {

      ctx.drawImage(
        img,
        this.x,
        this.y,
        this.width,
        this.height
      );

    } else {

      ctx.fillStyle = this.hover ? "#777" : "#444";
      ctx.fillRect(
        this.x,
        this.y,
        this.width,
        this.height
      );

      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "20px Arial";

      ctx.fillText(
        "PLAY",
        this.x + this.width / 2,
        this.y + this.height / 2 + 6
      );

    }

  }

}