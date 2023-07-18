let canvas = document.createElement('canvas');
canvas.id = 'canvas';
canvas.style='border:2px solid #000000';
document.body.appendChild(canvas);
let ctx = canvas.getContext('2d');

let canvasWidth = 700;
let canvasHeight = 700;
 
let gridSize = 5;
let cellSize = 100;
let offset = 100;

let points = [];

resize();
drawGrid();
drawPoints();

function resize() {
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;
}

function drawGrid() {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.beginPath();

    for(let i = 0; i <= gridSize; i++) {
        for(let j = 0; j <= gridSize; j++) {
            if(i < gridSize && j < gridSize) {
                ctx.rect(i * cellSize + offset, j * cellSize + offset, cellSize, cellSize);
            }
            points.push({x:i * cellSize + offset, y: j * cellSize + offset});
        }
    }
    ctx.stroke();
}

function drawPoints() {
    ctx.fillStyle = '#11EE28';
    points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    })
}