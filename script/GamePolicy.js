// script/GamePolicy.js
import Vector2 from "./geom/Vector2.js";

export default class GamePolicy {
    constructor(world) {
        this.world = world;

        // Table borders (same as your Ball logic)
        this.leftBorderX = 50;
        this.rightBorderX = 1455;
        this.topBorderY = 50;
        this.bottomBorderY = 775;

        // Pocket positions (center points)
        this.holes = [
            new Vector2(55, 55),        // top-left
            new Vector2(750, 40),       // top-middle
            new Vector2(1450, 55),      // top-right
            new Vector2(55, 760),       // bottom-left
            new Vector2(750, 780),      // bottom-middle
            new Vector2(1450, 760)      // bottom-right
        ];

        this.holeRadius = 45; // radius for detection
    }

    //-------------------------------------------------------
    // CHECK IF BALL CENTER FALLS INSIDE POCKET
    //-------------------------------------------------------
    isInsideHole(pos) {
        for (const h of this.holes) {
            const dx = pos.x - h.x;
            const dy = pos.y - h.y;
            if (dx*dx + dy*dy <= this.holeRadius * this.holeRadius) {
                return true;
            }
        }
        return false;
    }

    isBallInPocket(ball) {
    if (ball.inHole) return false;

    for (const h of this.holes) {
        const dx = ball.position.x - h.x;
        const dy = ball.position.y - h.y;

        if (dx*dx + dy*dy <= this.holeRadius * this.holeRadius) {
            return true;
        }
    }
    return false;
}


    //-------------------------------------------------------
    // HANDLE BALL DROPPING INTO POCKET
    //-------------------------------------------------------
  // script/GamePolicy.js (inside handleBallInHole)
    handleBallInHole(ball) {
        console.log("Ball pocketed:", ball);
        ball.inHole = true;
        ball.visible = false;
        ball.moving = false;
        ball.velocity.x = 0;
        ball.velocity.y = 0;
        // TODO: if white -> respawn logic; if object ball -> remove from table list
    }

}
