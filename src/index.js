let canvas = document.createElement('canvas');
canvas.id = 'canvas';
canvas.style='border:2px solid #000000';
document.body.appendChild(canvas);
let ctx = canvas.getContext('2d');

let canvasWidth = 500;
let canvasHeight = 500;

resize();

function resize() {
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;
}