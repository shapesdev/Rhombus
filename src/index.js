let canvas = document.createElement('canvas');
canvas.id = 'canvas';
canvas.style='border:2px solid #000000';
document.body.appendChild(canvas);
let ctx = canvas.getContext('2d');

let canvasWidth = 500;
let canvasHeight = 500;

resize();
drawCubes();

function resize() {
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;
}

function drawCubes() {
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    for(let i = 0; i < 5; i++) {
        ctx.rect(i * 100, i * 100, 100, 100);
    }
    ctx.stroke();
}