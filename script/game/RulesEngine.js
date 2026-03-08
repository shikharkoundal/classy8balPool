export default class RulesEngine {

static handlePocket(game, ball){

const current = game.currentPlayer;
const opponent = current === "A" ? "B" : "A";

/* ===== CUE BALL SCRATCH ===== */

if(ball === game.cueBall){

game.scratchThisTurn = true;

ball.x = 250;
ball.y = 300;

ball.vx = 0;
ball.vy = 0;

return;

}

/* ===== BLACK BALL ===== */

if(ball.color === "black"){

const remaining = game.balls.filter(
b => b.color === game.playerGroup[current]
).length;

if(remaining === 0){

game.winner = current;

}else{

game.winner = opponent;

}

game.gameOver = true;

return;

}

/* ===== RED / YELLOW ASSIGNMENT ===== */

if(ball.color === "red" || ball.color === "yellow"){

if(!game.playerGroup.A && !game.playerGroup.B){

game.playerGroup[current] = ball.color;

game.playerGroup[opponent] =
ball.color === "red" ? "yellow" : "red";

}

if(game.playerGroup[current] === ball.color){

game.ballPocketedThisTurn = true;

}

}

}

/* ===== TURN RESOLUTION ===== */

static resolveTurn(game){

if(game.scratchThisTurn || !game.ballPocketedThisTurn){

game.currentPlayer =
game.currentPlayer === "A" ? "B" : "A";

}

game.scratchThisTurn = false;
game.ballPocketedThisTurn = false;

}

}