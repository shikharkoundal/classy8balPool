export default class GameLoop {
    constructor(update, render) {
        this.update = update;
        this.render = render;
        this.lastTime = 0;
    }

    start() {
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(time) {
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }
}