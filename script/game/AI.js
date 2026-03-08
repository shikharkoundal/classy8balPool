export default class AI {
  static takeShot(game) {

    const { balls, cueBall, pockets } = game;

    let targets;

    if (!game.playerGroup?.A && !game.playerGroup?.B) {
      targets = balls.filter(b => b !== cueBall && b.color !== "black");
    } else {
      targets = balls.filter(
        b => b !== cueBall && b.color === game.playerGroup?.[game.aiPlayer]
      );
    }

    if (!targets.length) return;

    const target = targets[Math.floor(Math.random() * targets.length)];

    // choose closest pocket
    let bestPocket = pockets[0];
    let bestDist = Infinity;

    for (const p of pockets) {
      const dx = p.x - target.x;
      const dy = p.y - target.y;
      const d = dx * dx + dy * dy;

      if (d < bestDist) {
        bestDist = d;
        bestPocket = p;
      }
    }

    const dirX = bestPocket.x - target.x;
    const dirY = bestPocket.y - target.y;

    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    if (len === 0) return;

    const nx = dirX / len;
    const ny = dirY / len;

    const ghostX = target.x - nx * (cueBall.radius * 2);
    const ghostY = target.y - ny * (cueBall.radius * 2);

    let dx = ghostX - cueBall.x;
    let dy = ghostY - cueBall.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return;

    dx /= distance;
    dy /= distance;

    let errorMargin;

    if (game.aiDifficulty === "easy") errorMargin = 0.15;
    else if (game.aiDifficulty === "medium") errorMargin = 0.05;
    else errorMargin = 0.01;

    dx += (Math.random() - 0.5) * errorMargin;
    dy += (Math.random() - 0.5) * errorMargin;

    const mag = Math.sqrt(dx * dx + dy * dy);
    dx /= mag;
    dy /= mag;

    let power = 1200 + distance * 2;

    if (game.aiDifficulty === "easy") power *= 0.8;
    if (game.aiDifficulty === "hard") power *= 1.05;

    cueBall.vx = dx * power;
    cueBall.vy = dy * power;

    game.playerStats[game.currentPlayer].shots++;

    game.shotInProgress = true;
    game.ballPocketedThisTurn = false;
  }
}