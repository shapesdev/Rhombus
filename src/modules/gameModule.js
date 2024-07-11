import * as drawSystem from "./drawSystemModule.js";
import { setupGrid, generateRhombusGrid, generateSquareGrid } from "./gridModule.js";
import * as gameState from "./gameStateModule.js";

import { Player } from "../classes/player.js";

export function init(canvasHeight, canvasWidth, gridSize, tileSize) {
    drawSystem.setupCanvas(canvasHeight, canvasWidth, tileSize);
    initPlayers();
    initGrid(gridSize, tileSize);
}

export function onMouseMove(e) {
    drawSystem.draw(e);
}

export function onMouseRelease() {
    if(drawSystem.isDrawSuccessful()) {
        gameState.handleTileConquer();
    }
    drawSystem.reset();
}

export function onMousePress(e) {
    drawSystem.setPosition(e);
}

function initPlayers() {
    const player1 = new Player('John', 'black', 'red');
    const player2 = new Player('Tom', 'black', 'blue');
    gameState.addPlayers(player1, player2);

    player1.pointsElem = document.getElementById('player-points-1');
    player2.pointsElem = document.getElementById('player-points-2');

    document.getElementById('player-name-1').innerText = player1.playerName;
    document.getElementById('player-name-2').innerText = player2.playerName;
}

function initGrid(gridSize, tileSize) {
    setupGrid(gridSize, tileSize);
    //generateRhombusGrid();
    generateSquareGrid();
    drawSystem.drawGrid();
    //drawSystem.drawVertices();
}