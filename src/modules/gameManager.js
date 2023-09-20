import { DrawSystem } from "./drawSystem.js";
import { Player } from "./player.js";
import { GameStateManager } from "./gameStateManager.js";
import { Grid } from "./grid.js";

export class gameManager {
    constructor() {

    }

    init() {
        this.player1 = new Player('John', 'black', 'red');
        this.player2 = new Player('Tom', 'black', 'blue');
        this.grid = new Grid(7, 100);
        this.gameStateManager = new GameStateManager([this.player1, this.player2], this.grid);
        this.drawSystem = new DrawSystem(this.grid, this.gameStateManager);
    }

    onMouseMove(e) {
        this.drawSystem.draw(e);
    }
    
    onMouseRelease() {
        if(this.drawSystem.completeDraw()) {
            this.gameStateManager.handleTileConquer();
        }
        this.drawSystem.reset();
    }
    
    onMousePress(e) {
        this.drawSystem.setPosition(e);
    }
}