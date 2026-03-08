import Canvas2D from "../core/Canvas2D.js";

export default class HUD {

  static render(game) {

    const ctx = Canvas2D.ctx;

    const panelWidth = 500;
    const panelHeight = 60;

    const panelX = (Canvas2D.canvas.width - panelWidth) / 2;
    const panelY = 20;

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      `Player A: ${game.playerStats.A.scored}   |   Player B: ${game.playerStats.B.scored}`,
      Canvas2D.canvas.width / 2,
      panelY + 25
    );

    ctx.fillText(
      `Turn: ${game.currentPlayer}   |   AI: ${game.aiDifficulty}`,
      Canvas2D.canvas.width / 2,
      panelY + 45
    );

    ctx.restore();
  }
}