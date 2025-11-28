// script/systems/RuleEngine.js

export default class RuleEngine {
    constructor(turnManager, totals = { red: 7, yellow: 7 }) {
        this.turnManager = turnManager;
        this.totals = totals;
    }

    evaluateShot(context) {
        // context: { shooter, firstContactBall, pottedColors: array, scoreBefore, scoreAfter, foulThisShot }
        const shooter = context.shooter;
        const opp = shooter === "A" ? "B" : "A";

        const redDelta = context.scoreAfter.red - context.scoreBefore.red;
        const yellowDelta = context.scoreAfter.yellow - context.scoreBefore.yellow;

        const blackPotted = context.pottedColors.includes("black");

        // results object
        const res = {
            foul: !!context.foulThisShot,
            shooterContinues: false,
            switchTurn: false,
            gameOver: null, // { msg, winner }
            assign: null // { player, group }
        };

        // assignment when open table
        const bothUnassigned = (this.turnManager.playerGroup.A === null && this.turnManager.playerGroup.B === null);
        if (bothUnassigned) {
            if (redDelta > 0 && yellowDelta === 0) {
                res.assign = { player: shooter, group: "red" };
            } else if (yellowDelta > 0 && redDelta === 0) {
                res.assign = { player: shooter, group: "yellow" };
            }
        }

        // black handling
        if (blackPotted) {
            const redDone = context.scoreAfter.red >= this.totals.red;
            const yellowDone = context.scoreAfter.yellow >= this.totals.yellow;
            const group = this.turnManager.playerGroup[shooter];

            if (!group) {
                res.gameOver = { msg: "Black potted before groups assigned — LOSS", winner: opp };
                return res;
            }

            if (group === "red" && redDone) res.gameOver = { msg: "Player A wins!", winner: "A" };
            else if (group === "yellow" && yellowDone) res.gameOver = { msg: "Player B wins!", winner: "B" };
            else res.gameOver = { msg: "Black potted early — LOSS", winner: opp };

            return res;
        }

        if (res.assign) {
            // if assigned then shooter continues automatically
            res.shooterContinues = true;
            res.switchTurn = false;
        }

        if (res.foul) {
            res.switchTurn = true;
            res.shooterContinues = false;
            return res;
        }

        // Determine continuation
        const group = this.turnManager.playerGroup[shooter];
        let pottedOwn = false;
        if (!group) {
            if (redDelta + yellowDelta > 0) pottedOwn = true;
        } else {
            if ((group === "red" && redDelta > 0) || (group === "yellow" && yellowDelta > 0)) pottedOwn = true;
        }

        if (pottedOwn) res.shooterContinues = true;
        else {
            res.shooterContinues = false;
            res.switchTurn = true;
        }

        return res;
    }
}
