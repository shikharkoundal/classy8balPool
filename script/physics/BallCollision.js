// script/physics/BallCollision.js
import { BALL_DIAMETER } from "../game_objects/Ball.js";
import { eventBus } from "../systems/EventBus.js";

const COLLISION_THRESHOLD = BALL_DIAMETER - 1; // tuned
let firstContactReported = false;

function resetFirstContact() {
    firstContactReported = false;
}

eventBus.on("shotStart", () => {
    resetFirstContact();
});

// pairwise collision
export function collideBallPair(A, B) {
    const dx = B.position.x - A.position.x;
    const dy = B.position.y - A.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0 || dist >= COLLISION_THRESHOLD) return false;

    // report first contact if cue ball involved
    if (!firstContactReported) {
        if (A.isCueBall || B.isCueBall) {
            firstContactReported = true;
            const other = (A.isCueBall ? B : A);
            eventBus.emit("firstContact", other);
        }
    }

    // normal
    const nx = dx / dist;
    const ny = dy / dist;

    // overlap push
    const overlap = COLLISION_THRESHOLD - dist + 0.001;
    const half = overlap / 2;

    A.position.x -= nx * half;
    A.position.y -= ny * half;
    B.position.x += nx * half;
    B.position.y += ny * half;

    // relative velocity
    const rvx = A.velocity.x - B.velocity.x;
    const rvy = A.velocity.y - B.velocity.y;

    const velAlongNormal = rvx * nx + rvy * ny;

    // if separating -> skip impulse
    if (velAlongNormal > 0 && overlap < 0.05) return false;

    const restitution = 0.98; // slightly less than 1
    const j = -(1 + restitution) * velAlongNormal / 2; // equal masses

    const ix = j * nx;
    const iy = j * ny;

    A.velocity.x += ix;
    A.velocity.y += iy;

    B.velocity.x -= ix;
    B.velocity.y -= iy;

    A.moving = B.moving = true;
    return true;
}

export function collideAllBalls(ballArray) {
    for (let i = 0; i < ballArray.length; i++) {
        for (let j = i + 1; j < ballArray.length; j++) {
            collideBallPair(ballArray[i], ballArray[j]);
        }
    }
}
