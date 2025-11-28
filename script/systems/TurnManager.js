// script/systems/TurnManager.js
export default class TurnManager {
    constructor() {
        this.current = "A";
        this.playerGroup = { A: null, B: null }; // "red"/"yellow"/null
    }

    next() {
        this.current = this.current === "A" ? "B" : "A";
    }

    assign(player, group) {
        this.playerGroup[player] = group;
        this.playerGroup[player === "A" ? "B" : "A"] = (group === "red") ? "yellow" : "red";
    }

    getOpponent() {
        return this.current === "A" ? "B" : "A";
    }
}
