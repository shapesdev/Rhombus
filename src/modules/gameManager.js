import { DrawSystem } from "./drawSystem.js";
import { Player } from "./player.js";

export class gameManager {
    constructor() {
        this.drawSystem = new DrawSystem();
        this.playerOne = new Player('John');
        this.playerTwo = new Player('Tom');
    }

    init() {
        this.drawSystem.init(700, 700, 7, 100);
        this.initPlayers();
    }

    initPlayers() {
        const playerNameElement1 = document.getElementById("player-name1");
        const playerNameElement2 = document.getElementById("player-name2");
        playerNameElement1.textContent = this.playerOne.playerName;
        playerNameElement2.textContent = this.playerTwo.playerName;
    }

    onMouseMove(e) {
        this.drawSystem.draw(e);
    }
    
    onMouseRelease() {
        this.drawSystem.complete();
    }
    
    onMousePress(e) {
        this.drawSystem.setPosition(e);
    }
}