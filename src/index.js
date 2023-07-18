let canvas = document.createElement('canvas');
canvas.id = 'canvas';
canvas.style='border:2px solid #000000';
document.body.appendChild(canvas);
let ctx = canvas.getContext('2d');

let canvasWidth = 600;
let canvasHeight = 600;

let gridSize = 5;
let cellSize = 100;

resize();
drawGrid();

function resize() {
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;
}

function drawGrid() {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.beginPath();

    for(let i = 0; i < gridSize; i++) {
        for(let j = 0; j < gridSize; j++) {
            ctx.rect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }
    ctx.stroke();
}