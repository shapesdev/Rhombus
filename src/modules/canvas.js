// Canvas
let canvas;
let ctx;

let canvasWidth = 700;
let canvasHeight = 700;

// Grid
let gridSize = 7;
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
let overlap = false;
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
                points.push({x: i * cellSize, y: j * cellSize, isAvailable: true});
            }
        }
        this.drawPoints();
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

    drawPreviousLines() {
        if(lines.length > 0) {
            lines.forEach((line) => {
                this.drawLine(line.start, line.end);
            })
        }
    }
    
    draw(e) {
        if(e.buttons !== 1) return;
        this.setDirection(e);
        this.setStartPoint(e);
        this.setPosition(e);
        this.drawLine(startPoint, linePos, true);
    }
    
    setPosition(e) {
        const tempX = e.x - canvas.getBoundingClientRect().left;
        const tempY = e.y - canvas.getBoundingClientRect().top;
    
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
            const x = e.x - canvas.getBoundingClientRect().left;
            const y = e.y - canvas.getBoundingClientRect().top;
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

    completeDraw() {
        this.validateLine();
        this.reset();
    }

    validateLine() {
        const line = {
            start: {...startPoint},
            end: {...linePos},
        };

/*         if(this.isLineOverlapping(line)) {
            console.warn('Line is overlapping');
            this.resetGrid();
        } */
        {
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
                    
                    lines.push(line);
                    this.disablePoints(line);
                    this.drawLine(startPoint, linePos);
                }
                else {
                    console.warn('Line was too short');
                    this.resetGrid();
                }
            }
        }
    }

    disablePoints(line) {
        let isHorizontal = line.start.y == line.end.y ? true : false;
        if(isHorizontal) {
            for(let i = line.start.x + cellSize; i < line.end.x; i+=cellSize) {
                let item = points.find(item => item.x == i && item.y == line.start.y);
                if(!item.isAvailable) {
                    console.log('Should not allow to draw');
                }
                item.isAvailable = false;
            }
        }
        this.drawPoints();
    }

/*     isLineOverlapping(cur) {
        return lines.some((line) => {
            if(Math.min(cur.start.x, cur.end.x) < Math.max(line.end.x, line.start.x)
                && Math.max(cur.start.x, cur.end.x) > Math.min(line.start.x, line.end.x)
                && cur.start.y == line.start.y && cur.end.y == line.end.y) {
                console.log('Horizontal Collinear Overlap');
            }
            else if(Math.min(cur.start.y, cur.end.y) < Math.max(line.end.y, line.start.y)
                && Math.max(cur.start.y, cur.end.y) > Math.min(line.start.y, line.end.y)
                && cur.start.x == line.start.x && cur.end.x == line.end.x) {
                console.log('Vertical Collinear Overlap');
            }

            let isHorizontal = cur.start.y == cur.end.y ? true : false;
            if(isHorizontal) {
                //console.log(`Likely1 the intersection point is ${line.start.x} ${cur.start.y}`)
                if(Math.max(line.start.y, line.end.y) > cur.start.y
                    && Math.min(line.start.y, line.end.y) < cur.start.y
                    && line.start.x != cur.start.x && line.end.x != cur.end.x) {
                    console.log("Horizontal Overlap");
                }
            }
            else {

            }
            return false;
          });
    } */

    resetGrid() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        this.drawGridWithPath2D();
        this.drawPreviousLines();
    }

    reset() {
        direction = '';
        drawing = false;
        linePos = {x: 0, y: 0};
        startPoint = {x: 0, y: 0};
        oldX = 0;
        oldY = 0;
    }

    drawPoints() {
        points.forEach((point) => {
            if(point.isAvailable) {
                ctx.fillStyle = '#11EE28';
            }
            else {
                ctx.fillStyle = 'red';
            }
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        })
    }
}