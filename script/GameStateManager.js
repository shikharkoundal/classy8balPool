export default class GameStateManager {
    constructor() {
        this.current = null;
    }

    changeState(newState) {
        if (this.current?.onExit) this.current.onExit();
        this.current = newState;
        if (this.current?.onEnter) this.current.onEnter();
    }

    update(dt) {
        this.current?.update?.(dt);
    }

    draw() {
        this.current?.draw?.();
    }

    // NEW
    handleMouseMove(x, y) {
        this.current?.handleMouseMove?.(x, y);
    }

    // NEW
    handleMouseDown() {
        this.current?.handleMouseDown?.();
    }

    // NEW
    handleMouseUp() {
        this.current?.handleMouseUp?.();
    }
}
