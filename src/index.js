import { DrawSystem } from "./modules/drawSystem.js";
import { Player } from "./modules/player.js";

const drawSystem = new DrawSystem();
const playerOne = new Player('John');
const playerTwo = new Player('Tom');

// Events
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseRelease);
document.addEventListener('mousedown', onMousePress);

init();

function init() {
    drawSystem.init(700, 700, 7, 100);
    //initPlayers();
}

function initPlayers() {
    const playerNameElement1 = document.getElementById("player-name1");
    const playerNameElement2 = document.getElementById("player-name2");
    playerNameElement1.textContent = playerOne.playerName;
    playerNameElement2.textContent = playerTwo.playerName;
}

function onMouseMove(e) {
    drawSystem.draw(e);
}

function onMouseRelease() {
    drawSystem.complete();
}

function onMousePress(e) {
    drawSystem.setPosition(e);
}