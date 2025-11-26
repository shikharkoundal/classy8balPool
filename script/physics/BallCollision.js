// script/physics/BallCollision.js
import { BALL_DIAMETER } from "../game_objects/Ball.js";

export function collideBalls(A, B) {
    const dx = B.position.x - A.position.x;
    const dy = B.position.y - A.position.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist === 0 || dist >= BALL_DIAMETER) return false;

    console.log("---- POSSIBLE COLLISION ----");
    console.log("Before:");
    console.log(" A pos:", A.position, "vel:", A.velocity);
    console.log(" B pos:", B.position, "vel:", B.velocity);
    console.log(" dist:", dist);

    // Normal
    const nx = dx / dist;
    const ny = dy / dist;

    // Small bias to avoid sticky contact
    const overlap = BALL_DIAMETER - dist + 0.001;
    const half = overlap / 2;

    // Push apart
    A.position.x -= nx * half;
    A.position.y -= ny * half;
    B.position.x += nx * half;
    B.position.y += ny * half;

    // Relative velocity
    const rvx = A.velocity.x - B.velocity.x;
    const rvy = A.velocity.y - B.velocity.y;

    // Velocity along normal
    const velAlongNormal = rvx * nx + rvy * ny;

    // If moving apart and overlap is tiny, skip impulse.
    // But if we have significant overlap, still resolve impulse.
    if (velAlongNormal > 0 && overlap < 0.5) {
        // already separating — no impulse needed
        console.log("Balls moving apart — no impulse.");
        return false;
    }

    // perfectly elastic (equal masses) restitution ~ 1.0
    const restitution = 0.895; // slightly less than 1 so simulation is stable
    // impulse scalar for equal masses: j = -(1+e) * velAlongNormal / (1/m + 1/m) = -(1+e)*velAlongNormal/2
    const j = -(1 + restitution) * velAlongNormal / 2;

    // impulse vector
    const ix = j * nx;
    const iy = j * ny;

    // apply
    A.velocity.x += ix;
    A.velocity.y += iy;

    B.velocity.x -= ix;
    B.velocity.y -= iy;

    // ensure moving flags
    A.moving = B.moving = true;

    console.log(">>> COLLISION RESOLVED <<<");
    console.log(" Normal:", { nx, ny });
    console.log(" Overlap:", overlap);
    console.log(" Relative vel:", { rvx, rvy });
    console.log(" velAlongNormal:", velAlongNormal);
    console.log(" Impulse:", { j, ix, iy });
    console.log("After:");
    console.log(" A vel:", A.velocity);
    console.log(" B vel:", B.velocity);
    console.log("-----------------------------");

    return true;
}
