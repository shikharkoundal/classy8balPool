// lightweight trainer that will not block PvP
class AITrainer {
  constructor() {
    this.opponents = [];
    this.currentOpponent = null;
    this.finishedSession = true;
    this.iteration = 0;
    this.bestOpponentIndex = 0;
    this.bestOpponentEval = 0;
    this.initialState = null;
    this.initialGamePolicyState = null;
    this.state = null;
    this.gamePolicy = null;
  }

  init(state, gamePolicy, game) {
    this.state = state;
    this.gamePolicy = gamePolicy;
    this.finishedSession = true;
    this.iteration = 0;
  }

  startSession() {
    // minimal: immediately finish so world.turn resolution can proceed
    this.finishedSession = true;
  }
}

const AI = new AITrainer();
export default AI;
