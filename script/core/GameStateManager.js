// import MenuBall from "../game/MenuBall";
export default class GameStateManager {

  constructor() {
    this.state = null;
  }

  changeState(newState) {

    if (this.state && this.state.exit) {
      this.state.exit();
    }

    this.state = newState;

    if (this.state.enter) {
      this.state.enter();
    }

  }

  update(dt) {
    if (this.state && this.state.update) {
      this.state.update(dt);
    }
  }

  render() {
    if (this.state && this.state.render) {
      this.state.render();
    }
  }

}

// for(const ball of this.menuBalls){
//   ball.render();
// }