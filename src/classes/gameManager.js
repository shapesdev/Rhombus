import { draw, isDrawSuccessful, reset, drawGrid, setPosition } from "../modules/drawSystem.js";
import { generate, updateLegalMoves } from "../modules/grid.js";
import { Player } from "./player.js";
import { GameStateManager } from "./gameStateManager.js";

export class gameManager {
    constructor() {
        this.player1 = new Player('John', 'black', 'red');
        this.player2 = new Player('Tom', 'black', 'blue');
        this.gameStateManager = new GameStateManager([this.player1, this.player2]);
    }

    init() {
        generate();
        drawGrid();
    }

    onMouseMove(e) {
        draw(e);
    }
    
    onMouseRelease() {
        if(isDrawSuccessful()) {
            this.gameStateManager.handleTileConquer();
            updateLegalMoves();
        }
        reset();
    }
    
    onMousePress(e) {
        setPosition(e);
    }
}