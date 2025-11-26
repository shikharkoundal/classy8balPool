// script/AI/AIPolicy.js
// Evaluates a simulated game state for the trainer

export default class AIPolicy {
  constructor() {}

  /**
   * @param {Object} state  - a GameWorld instance (live during evaluation)
   * @param {Object} gamePolicy - a GamePolicy instance (should be a copy)
   * @returns {number} evaluation score (higher = better)
   */
  evaluate(state, gamePolicy) {
    let evaluation = 1;

    // Add up pairwise distances of non-white, non-holed balls
    for (let i = 0; i < state.balls.length; i++) {
      for (let j = i + 1; j < state.balls.length; j++) {
        const firstBall = state.balls[i];
        const secondBall = state.balls[j];

        if (
          firstBall === state.whiteBall ||
          secondBall === state.whiteBall ||
          firstBall.inHole ||
          secondBall.inHole
        ) {
          continue;
        }

        evaluation += firstBall.position.distanceFrom(secondBall.position);
      }
    }

    evaluation = evaluation / 5800;

    // Reward non-first-collision (original logic gave bonus if not firstCollision)
    if (!gamePolicy.firstCollision) evaluation += 100;

    // Reward valid balls pocketed this turn strongly
    evaluation += 2000 * gamePolicy.validBallsInsertedOnTurn;

    // Apply end-of-turn logic on the (copied) gamePolicy to get fouls/wins applied
    gamePolicy.updateTurnOutcome();

    if (gamePolicy.won) {
      evaluation += gamePolicy.foul ? -10000 : 10000;
    }

    if (gamePolicy.foul) {
      evaluation -= 3000;
    }

    return evaluation;
  }
}
