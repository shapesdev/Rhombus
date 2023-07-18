// Canvas
let canvas;
let ctx;

let canvasWidth = 500;
let canvasHeight = 500;

// Grid
let gridSize = 5;
let cellSize = 100;

// Line drawing
let points = [];
let linePos = {x: 0, y: 0};
let startPoint = {x: 0, y: 0};
let direction = '';
let oldX = 0;
let oldY = 0;
let drawing = false;
let lineLength = 300;

export class Canvas {
    constructor() {

    }

    init() {
        canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        canvas.style= 'border:2px solid #000000';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');

        this.resize();
        this.drawGridWithPath2D();
    }

    resize() {
        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = canvasHeight;
    }
    
    drawGridWithPath2D() {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000';
        for(let i = 0; i <= gridSize; i++) {
            for(let j = 0; j <= gridSize; j++) {
                if(i < gridSize && j < gridSize) {
                    const path = new Path2D();
                    path.rect(i * cellSize, j * cellSize, cellSize, cellSize);
                    path.closePath();
                    ctx.stroke(path);
                }
                points.push({x: i * cellSize, y: j * cellSize});
            }
        }
    }
    
    draw(e) {
        if(e.buttons !== 1) return;
    
        this.setDirection(e);
        this.setStartPoint(e);
    
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'green';
    
        ctx.moveTo(linePos.x, linePos.y);
        this.setPosition(e);
        this.limitLineLength();
        ctx.lineTo(linePos.x, linePos.y);
        ctx.stroke();
    }
    
    setPosition(e) {
        let tempPos = {x: 0, y: 0};
        let canvasRect = canvas.getBoundingClientRect();
        tempPos.x = e.x - canvasRect.left;
        tempPos.y = e.y - canvasRect.top;
    
        if(direction == 'East' || direction == 'West') {
            if(linePos.y != canvasHeight && linePos.y != 0) {
                linePos.x = tempPos.x;
                linePos.y = startPoint.y;
            }
        }
        if(direction == 'South' || direction == 'North') {
            if(linePos.x != canvasWidth && linePos.x != 0) {
                linePos.x = startPoint.x;
                linePos.y = tempPos.y;
            }
        }
    }
    
    setDirection(e) {
        if(direction == '') {
            if(e.pageX > oldX && e.pageY == oldY) {
                direction = 'East';
            }
            else if(e.pageX < oldX && e.pageY == oldY) {
                direction = 'West';
            }
            else if(e.pageX == oldX && e.pageY > oldY) {
                direction = 'South';
            }
            else if(e.pageX == oldX && e.pageY < oldY) {
                direction = 'North';
            }
        }
    
        oldX = e.pageX;
        oldY = e.pageY;
    }
    
    setStartPoint(e) {
        if(!drawing) {
            let canvasRect = canvas.getBoundingClientRect();
            let x = e.x - canvasRect.left;
            let y = e.y - canvasRect.top;
            let minDistance = 1000000;
            let closestPoint;
    
            points.forEach((point) => {
                let distance = Math.sqrt(Math.pow((x - point.x), 2) +
                Math.pow((y - point.y), 2));
                if(distance < minDistance) {
                    minDistance = distance;
                    closestPoint = point;
                }
            });
            startPoint.x = linePos.x = closestPoint.x;
            startPoint.y = linePos.y = closestPoint.y;
            drawing = true;
        }
    }
    
    limitLineLength() {
        if(linePos.x - startPoint.x > lineLength) {
            linePos.x = startPoint.x + lineLength;
        }
        else if(startPoint.x - linePos.x > lineLength) {
            linePos = startPoint.x - lineLength;
        }
    
        if(linePos.y - startPoint.y > lineLength) {
            linePos.y = startPoint.y + lineLength;
        }
        else if(startPoint.y - linePos.y > lineLength) {
            linePos.y = startPoint.y - lineLength;
        }
    }
    
    reset() {
        direction = '';
        drawing = false;
        linePos = {x: 0, y: 0};
        startPoint = {x: 0, y: 0};
        oldX = 0;
        oldY = 0;
    }
}