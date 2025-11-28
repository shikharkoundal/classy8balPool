// script/physics/PhysicsWorld.js
import { collideAllBalls } from "./BallCollision.js";
import { eventBus } from "../systems/EventBus.js";

export default class PhysicsWorld {
    constructor(policy) {
        this.policy = policy; // GamePolicy instance
    }

    step(balls, dt) {
        // integrate positions
        for (const b of balls) {
            if (b.inHole || b.isAnimating) continue;
            b.integratePosition(dt);
        }

        // collisions
        const active = balls.filter(b => !b.inHole && !b.isAnimating);
        if (active.length > 1) collideAllBalls(active);

        // apply friction, border bounce, and update moving flag
        for (const b of balls) {
            if (b.inHole || b.isAnimating) continue;
            b.applyFrictionScaled(dt);
            b.borderBounce(this.policy);
        }

        // detect if all stopped
        const anyMoving = balls.some(b => b.moving && !b.inHole && !b.isAnimating);
        if (!anyMoving) {
            eventBus.emit("allBallsStopped", {});
        }
    }
}
