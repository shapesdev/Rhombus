import { Grid } from "./modules/grid.js";

const grid = new Grid();

// Events
document.addEventListener('mousemove', function(e) {grid.draw(e)});
document.addEventListener('mousedown', function(e) {grid.setPosition(e)});
document.addEventListener('mouseup', function() {grid.completeDraw()});

init();

function init() {
    grid.init(700, 700, 7, 100);
}