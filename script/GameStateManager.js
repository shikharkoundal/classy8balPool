// script/GameStateManager.js
export default class GameStateManager {
    constructor(game) {
        this.game = game;
        this.currentState = null;
    }

    changeState(newState) {
        this.currentState = newState;
        if (this.currentState.onEnter)
            this.currentState.onEnter();
    }

    update(dt) {
        if (this.currentState && this.currentState.update)
            this.currentState.update(dt);
    }

    draw() {
        if (this.currentState && this.currentState.draw)
            this.currentState.draw();
    }

    // ===== FIXED INPUT ROUTING =====
    handleMouseMove(x, y) {
        if (this.currentState && this.currentState.handleMouseMove)
            this.currentState.handleMouseMove(x, y);
    }

    handleMouseDown(x, y) {
        if (this.currentState && this.currentState.handleMouseDown)
            this.currentState.handleMouseDown(x, y);
    }

    handleMouseUp(x, y) {
        if (this.currentState && this.currentState.handleMouseUp)
            this.currentState.handleMouseUp(x, y);
    }

    handleClick(x, y) {
        if (this.currentState && this.currentState.handleClick)
            this.currentState.handleClick(x, y);
    }
}
