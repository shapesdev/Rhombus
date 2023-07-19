// Canvas
let canvas;
let ctx;

let canvasWidth = 500;
let canvasHeight = 500;

// Grid
let gridSize = 5;
let cellSize = 100;

// Line drawing
const directionMap = {
    East: {x: 1, y: 0},
    West: {x: -1, y: 0},
    South: {x: 0, y: 1},
    North: {x: 0, y: -1},
};
let direction = '';

let points = [];
let lines = [];

let linePos = {x: 0, y: 0};
let startPoint = {x: 0, y: 0};
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
        let tempX = e.x - canvas.getBoundingClientRect().left;
        let tempY = e.y - canvas.getBoundingClientRect().top;
    
        if(['East', 'West'].includes(direction)) {
            if(linePos.y != canvasHeight && linePos.y != 0 
                && ((direction === 'East' && tempX >= linePos.x) 
                || (direction === 'West' && tempX <= linePos.x))) {

                linePos = { x: tempX, y: startPoint.y };
            }
        }
        else if(['South', 'North'].includes(direction)) {
            if(linePos.x != canvasWidth && linePos.x != 0
                && ((direction === 'South' && tempY >= linePos.y) 
                || (direction === 'North' && tempY <= linePos.y))) {

                linePos = { x: startPoint.x, y: tempY };
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
            let x = e.x - canvas.getBoundingClientRect().left;
            let y = e.y - canvas.getBoundingClientRect().top;
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
            linePos.x = startPoint.x - lineLength;
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

    drawLines() {
        if(lines.length > 0) {
            lines.forEach((line) => {
                ctx.beginPath();
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                ctx.strokeStyle = 'green';
            
                ctx.moveTo(line.startX, line.startY);
                ctx.lineTo(line.endX, line.endY);
                ctx.stroke();
            })
        }
    }

    checkLineLength() {
        if(direction in directionMap) {
            const dir = directionMap[direction];
            let length;

            if(dir.x !== 0) {
                length = Math.abs(linePos.x - startPoint.x);
            }
            else {
                length = Math.abs(linePos.y - startPoint.y);
            }

            if(length / lineLength > 0.85) {
                linePos.x = startPoint.x + lineLength * dir.x;
                linePos.y = startPoint.y + lineLength * dir.y;

                lines.push({startX: startPoint.x, endX: linePos.x,
                startY: startPoint.y, endY: linePos.y});

                ctx.lineTo(linePos.x, linePos.y);
                ctx.stroke();
            }
            else {
                console.warn('Line was too short');
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                this.drawGridWithPath2D();
                this.drawLines();
            }
        }
    }

    completeDraw() {
        this.checkLineLength();
        this.reset();
    }
}