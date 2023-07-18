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
let allowedLineLength = 300;

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
    
        if(['East', 'West'].includes(direction)) {
            if(linePos.y != canvasHeight && linePos.y != 0) {
                linePos = { x: tempPos.x, y: startPoint.y };
            }
        }
        if(['South', 'North'].includes(direction)) {
            if(linePos.x != canvasWidth && linePos.x != 0) {
                linePos = { x: startPoint.x, y: tempPos.y };
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
        if(linePos.x - startPoint.x > allowedLineLength) {
            linePos.x = startPoint.x + allowedLineLength;
        }
        else if(startPoint.x - linePos.x > allowedLineLength) {
            linePos = startPoint.x - allowedLineLength;
        }
    
        if(linePos.y - startPoint.y > allowedLineLength) {
            linePos.y = startPoint.y + allowedLineLength;
        }
        else if(startPoint.y - linePos.y > allowedLineLength) {
            linePos.y = startPoint.y - allowedLineLength;
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

    completeDraw(e) {
        if(direction == 'East') {
            let length = linePos.x - startPoint.x;
            if(length / allowedLineLength > 0.9) {
                linePos.x = startPoint.x + allowedLineLength;
                ctx.lineTo(linePos.x, linePos.y);
                ctx.stroke();
                console.log('Should finish');
            }
            else {
                console.warn("Too short");
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                this.drawGridWithPath2D();
            }
        }
        if(direction == 'West') {
            let length = startPoint.x - linePos.x;
            if(length / allowedLineLength > 0.9) {
                linePos.x = startPoint.x - allowedLineLength;
                ctx.lineTo(linePos.x, linePos.y);
                ctx.stroke();
                console.log('Should finish');
            }
            else {
                console.warn("Too short");
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                this.drawGridWithPath2D();
            }
        }
        this.reset();
    }
}