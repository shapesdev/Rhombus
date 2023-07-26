import { DrawSystem } from "./modules/drawSystem.js";

const drawSystem = new DrawSystem();

// Events
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseRelease);
document.addEventListener('mousedown', onMousePress);

init();

function init() {
    drawSystem.init(700, 700, 7, 100);
}

function onMouseMove(e) {
    drawSystem.draw(e);
}

function onMouseRelease() {
    drawSystem.complete();
}

function onMousePress(e) {
    drawSystem.setPosition(e)
}