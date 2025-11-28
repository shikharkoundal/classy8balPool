// script/systems/FloatingTextSystem.js

export default class FloatingTextSystem {
    constructor() {
        this.items = []; // {text,x,y,vy,alpha,timer,duration}
    }

    spawn(text, x, y) {
        this.items.push({
            text, x, y,
            vy: -40 - Math.random()*30,
            alpha: 1,
            timer: 0,
            duration: 1.0
        });
    }

    update(dt) {
        for (const it of this.items) {
            it.timer += dt;
            it.y += it.vy * dt;
            it.alpha = Math.max(0, 1 - (it.timer / it.duration));
        }
        this.items = this.items.filter(it => it.timer < it.duration);
    }

    draw(ctx) {
        if (!this.items.length) return;
        ctx.save();
        ctx.textAlign = "center";
        ctx.font = "20px Arial";
        for (const it of this.items) {
            ctx.globalAlpha = it.alpha;
            ctx.fillStyle = "#fff";
            ctx.fillText(it.text, it.x, it.y);
        }
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}
