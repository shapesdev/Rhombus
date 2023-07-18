// Canvas
let canvas = document.createElement('canvas');
canvas.id = 'canvas';
canvas.style='border:2px solid #000000';
document.body.appendChild(canvas);
let ctx = canvas.getContext('2d');

let canvasWidth = 700;
let canvasHeight = 700;

// Grid
let gridSize = 5;
let cellSize = 100;
let offset = 100;

let points = [];

// Events
document.addEventListener('mousedown', getClosestPoint);

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

function getClosestPoint(e) {
    let tempPos = {x: 0, y: 0};
    tempPos.x = e.x;
    tempPos.y = e.y;
    
    let minDistance = 1000000;
    let closestPoint;

    points.forEach((point) => {
        let distance = Math.sqrt(Math.pow((tempPos.x - point.x), 2) + 
        Math.pow((tempPos.y - point.y), 2));
        if(distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    });
    console.log(closestPoint);
}