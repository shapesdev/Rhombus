let canvas = document.createElement('canvas');
canvas.id = 'canvas';
canvas.style='border:2px solid #000000';
document.body.appendChild(canvas);
let ctx = canvas.getContext('2d');

let canvasWidth = 500;
let canvasHeight = 500;

resize();
drawCubes();
setInterval(drawCubes, 250);

function resize() {
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;
}

function drawCubes() {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for(let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.rect(i * 100, i * 100, 100, 100);
        ctx.strokeStyle = getRandomColor();
        ctx.stroke();
    }
}

function getRandomColor() {
    let hexColor = Math.floor(Math.random() * 16777216).toString(16);
    let randColor = hexColor.padStart(6, '0');
    return `#${randColor}`;
}