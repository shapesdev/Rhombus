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
let maxLineLength = 300;

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

    drawLine(start, end, realtime = false) {
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'green';
    
        ctx.moveTo(start.x, start.y);
        if(realtime) {
            this.limitLineLength();
        }
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
    
    draw(e) {
        if(e.buttons !== 1) return;
        this.setDirection(e);
        this.setStartPoint(e);
        this.setPosition(e);
        this.drawLine(startPoint, linePos, true);
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
        if(linePos.x - startPoint.x > maxLineLength) {
            linePos.x = startPoint.x + maxLineLength;
        }
        else if(startPoint.x - linePos.x > maxLineLength) {
            linePos.x = startPoint.x - maxLineLength;
        }
    
        if(linePos.y - startPoint.y > maxLineLength) {
            linePos.y = startPoint.y + maxLineLength;
        }
        else if(startPoint.y - linePos.y > maxLineLength) {
            linePos.y = startPoint.y - maxLineLength;
        }
    }

    drawPreviousLines() {
        if(lines.length > 0) {
            lines.forEach((line) => {
                this.drawLine(line.start, line.end);
            })
        }
    }

    completeDraw() {
        this.checkLineLength();
        this.reset();
    }

    checkLineLength() {
        if(direction in directionMap) {
            const dir = directionMap[direction];
            let length;

            if(dir.x !== 0) {
                length = Math.abs(linePos.x - startPoint.x) / maxLineLength;
            }
            else {
                length = Math.abs(linePos.y - startPoint.y) / maxLineLength;
            }

            if(length > 0.85 && linePos.x <= canvasWidth && linePos.y <= canvasHeight
                && linePos.x >= 0 && linePos.y >= 0) {
                linePos.x = startPoint.x + maxLineLength * dir.x;
                linePos.y = startPoint.y + maxLineLength * dir.y;

                let line = {
                    start: {...startPoint},
                    end: {...linePos},
                };

                lines.push(line);
                this.drawLine(startPoint, linePos);
            }
            else {
                console.warn('Line was too short');
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                this.drawGridWithPath2D();
                this.drawPreviousLines();
            }
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