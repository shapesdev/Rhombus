import { draw, isDrawSuccessful, reset, drawGrid, setPosition } from "./drawSystem.js";
import { generateGrid } from "./grid.js";
import { players, handleTileConquer, initStartingPlayer } from "./gameStateManager.js";

import { Player } from "../classes/player.js";

let player1 = null;
let player2 = null;

export function init() {
    initPlayers();
    generateGrid();
    drawGrid();
}

export function onMouseMove(e) {
    draw(e);
}

export function onMouseRelease() {
    if(isDrawSuccessful()) {
        handleTileConquer();
    }
    reset();
}

export function onMousePress(e) {
    setPosition(e);
}

function initPlayers() {
    player1 = new Player('John', 'black', 'red');
    player2 = new Player('Tom', 'black', 'blue');
    players.push(player1);
    players.push(player2);

    initStartingPlayer(player1);

    player1.pointsElem = document.getElementById('player-points-1');
    player2.pointsElem = document.getElementById('player-points-2');

    document.getElementById('player-name-1').innerText = player1.playerName;
    document.getElementById('player-name-2').innerText = player2.playerName;
}