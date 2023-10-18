import { draw, isDrawSuccessful, reset, drawGrid, setPosition } from "./drawSystem.js";
import { generateGrid, updateLegalMoves } from "./grid.js";
import { players, handleTileConquer } from "./gameStateManager.js";

import { Player } from "../classes/player.js";

let player1 = null;
let player2 = null;

export function init() {
    player1 = new Player('John', 'black', 'red');
    player2 = new Player('Tom', 'black', 'blue');
    players.push(player1);
    players.push(player2);

    generateGrid();
    drawGrid();
}

export function onMouseMove(e) {
    draw(e);
}

export function onMouseRelease() {
    if(isDrawSuccessful()) {
        handleTileConquer();
        updateLegalMoves();
    }
    reset();
}

export function onMousePress(e) {
    setPosition(e);
}