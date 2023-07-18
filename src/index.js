// Canvas
let canvas = document.createElement('canvas');
canvas.id = 'canvas';
canvas.style='border:2px solid #000000';
document.body.appendChild(canvas);
let ctx = canvas.getContext('2d');

let canvasWidth = 500;
let canvasHeight = 500;

// Grid
let gridSize = 5;
let cellSize = 100;
let offset = 100;

let points = [];

// Events
document.addEventListener('mousedown', highlightPath2D);

resize();
drawGridWithPath2D();

function resize() {
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;
}

function drawGridWithPath2D() {
    for(let i = 0; i < gridSize; i++) {
        for(let j = 0; j < gridSize; j++) {
            const path = new Path2D();
            path.rect(i * cellSize, j * cellSize, cellSize, cellSize);
            path.closePath();

            ctx.fillStyle = '#FFFFFF';
            ctx.fill(path);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#000000';
            ctx.stroke(path);

            points.push(path);
        }
    }
}

function highlightPath2D(e) {
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.x - canvasRect.x;
    const y = e.y - canvasRect.y;

    points.forEach((point) => {
        if(ctx.isPointInPath(point, x, y)) {
            ctx.fillStyle = '#39C738';
            ctx.fill(point);
        }
    });
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
}