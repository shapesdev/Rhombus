import { Canvas } from "./modules/canvas.js";

let canvas = new Canvas();

// Events
document.addEventListener('mousemove', function(e) {canvas.draw(e)});
document.addEventListener('mousedown', function(e) {canvas.setPosition(e)});
document.addEventListener('mouseup', function() {canvas.completeDraw()});

init();

function init() {
    canvas.init();
}