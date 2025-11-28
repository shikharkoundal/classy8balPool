// script/systems/PocketSystem.js
import { eventBus } from "./EventBus.js";

export default class PocketSystem {
    constructor(policy) {
        this.policy = policy; // GamePolicy
    }

    detectAndStartPocket(balls) {
        // find balls that are within hole radius and are not already inHole/animating
        for (const b of balls) {
            if (b.inHole || b.isAnimating) continue;
            if (this.policy.isBallInPocket(b)) {
                // record last pocket position in policy for animation target
                // prefer pocket center rather than ball's current pos
                // the GamePolicy stores holes; find nearest
                let nearest = { x: b.position.x, y: b.position.y };
                let bestDist = Infinity;
                for (const h of this.policy.holes) {
                    const dx = b.position.x - h.x;
                    const dy = b.position.y - h.y;
                    const d2 = dx*dx + dy*dy;
                    if (d2 < bestDist) {
                        bestDist = d2;
                        nearest = { x: h.x, y: h.y };
                    }
                }
                if (b.isCueBall) {
                    // Notify generic pocket handler (score system etc.)
                    eventBus.emit("ballPocketed", { ball: b, pocketPos: nearest });

                    // 🔥 NEW: Tell gameplay “this is a scratch”
                    eventBus.emit("cueBallPocketed");

                    // Cue ball does NOT animate, does NOT disappear
                    b.inHole = true;
                    b.isAnimating = false;
                    b.removeMe = false;

                    // stop movement instantly
                    b.velocity.x = 0;
                    b.velocity.y = 0;

                    return;
                }




                // mark inHole true to stop physics; but still keep visible for animation
                b.inHole = true;
                // emit event for gameplay to handle scoring/animations
                eventBus.emit("ballPocketed", { ball: b, pocketPos: nearest });
            }
        }
    }
}
