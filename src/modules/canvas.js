// Line drawing
const directionMap = {
    East: {x: 1, y: 0},
    West: {x: -1, y: 0},
    South: {x: 0, y: 1},
    North: {x: 0, y: -1},
};

export class Canvas {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.canvasWidth = 700;
        this.canvasHeight = 700;
        this.gridSize = 7;
        this.cellSize = 100;
        this.maxLineLength = 300;
        this.points = [];
        this.lines = [];
        this.linePos = { x: 0, y: 0 };
        this.startPoint = { x: 0, y: 0 };
        this.oldX = 0;
        this.oldY = 0;
        this.drawing = false;
        this.direction = '';
    }

    init() {
        this.createCanvas();
        this.resize();
        this.drawGridWithPath2D();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'canvas';
        this.canvas.style= 'border:2px solid #000000';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    resize() {
        this.ctx.canvas.width = this.canvasWidth;
        this.ctx.canvas.height = this.canvasHeight;
    }
    
    drawGridWithPath2D() {
        this.ctx.lineWidth = 0.2;
        this.ctx.strokeStyle = '#000000';
        const pointsCollectionEmpty = this.points.length === 0;

        for(let i = 0; i <= this.gridSize; i++) {
            for(let j = 0; j <= this.gridSize; j++) {
                if(i < this.gridSize && j < this.gridSize) {
                    const path = new Path2D();
                    path.rect(i * this.cellSize, j * this.cellSize, this.cellSize, this.cellSize);
                    path.closePath();
                    this.ctx.stroke(path);
                }
                if(pointsCollectionEmpty) {
                    this.points.push({x: i * this.cellSize, y: j * this.cellSize, isAvailable: true});
                }
            }
        }
        this.drawPoints();
    }

    drawLine(start, end, realtime = false) {
        const {ctx} = this;

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
        ctx.moveTo(start.x, start.y);

        if(realtime) {
            this.limitLineLength();
        }

        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    drawPreviousLines() {
        if(this.lines.length > 0) {
            this.lines.forEach((line) => {
                this.drawLine(line.start, line.end);
            })
        }
    }
    
    draw(e) {
        if(e.buttons !== 1) return;
        this.setDirection(e);
        this.setStartPoint(e);
        this.setPosition(e);
        this.drawLine(this.startPoint, this.linePos, true);
    }
    
    setPosition(e) {
        const x = e.x - this.canvas.getBoundingClientRect().left;
        const y = e.y - this.canvas.getBoundingClientRect().top;
        const { direction, canvasHeight, canvasWidth, linePos, startPoint } = this;
    
        if(['East', 'West'].includes(direction)) {
            if(linePos.y != canvasHeight && linePos.y != 0 
                && ((direction === 'East' && x >= linePos.x) 
                || (direction === 'West' && x <= linePos.x))) {

                    linePos = { x: x, y: startPoint.y };
            }
        }
        else if(['South', 'North'].includes(direction)) {
            if(linePos.x != canvasWidth && linePos.x != 0
                && ((direction === 'South' && y >= linePos.y) 
                || (direction === 'North' && y <= linePos.y))) {

                linePos = { x: startPoint.x, y: y };
            }
        }
    }
    
    setDirection(e) {
        if(this.direction == '') {
            const {pageX, pageY} = e;
            let x = this.oldX;
            let y = this.oldY;

            if(pageX > x && pageY == y) {
                this.direction = 'East';
            }
            else if(pageX < x && pageY == y) {
                this.direction = 'West';
            }
            else if(pageX == x && pageY > y) {
                this.direction = 'South';
            }
            else if(pageX == x && pageY < y) {
                this.direction = 'North';
            }
        }
        this.oldX = e.pageX;
        this.oldY = e.pageY;
    }
    
    setStartPoint(e) {
        if(!this.drawing) {
            const x = e.x - this.canvas.getBoundingClientRect().left;
            const y = e.y - this.canvas.getBoundingClientRect().top;
            let minDistance = 1000000;
            let closestPoint;
    
            this.points.forEach((point) => {
                let distance = Math.sqrt(Math.pow((x - point.x), 2) +
                Math.pow((y - point.y), 2));
                if(distance < minDistance) {
                    minDistance = distance;
                    closestPoint = point;
                }
            });
            this.startPoint.x = this.linePos.x = closestPoint.x;
            this.startPoint.y = this.linePos.y = closestPoint.y;
            this.drawing = true;
        }
    }
    
    limitLineLength() {
        const { linePos, startPoint, maxLineLength } = this;

        if (linePos.x - startPoint.x > maxLineLength) {
            linePos.x = startPoint.x + maxLineLength;
        } else if (startPoint.x - linePos.x > maxLineLength) {
            linePos.x = startPoint.x - maxLineLength;
        }

        if (linePos.y - startPoint.y > maxLineLength) {
            linePos.y = startPoint.y + maxLineLength;
        } else if (startPoint.y - linePos.y > maxLineLength) {
            linePos.y = startPoint.y - maxLineLength;
        }
    }

    completeDraw() {
        this.validateLine();
        this.reset();
    }

    validateLine() {
        const {direction, linePos, startPoint, maxLineLength, canvasWidth, canvasHeight} = this;

        const line = {
            start: {...startPoint},
            end: {...linePos},
        };

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
                
                this.lines.push(line);
                this.updateDrawPoints(line);
            }
            else {
                console.warn('Line was too short');
                this.resetGrid();
            }
        }
    }

    updateDrawPoints(line) {
        const isHorizontal = line.start.y === line.end.y;
        let p1, p2;
        let dir;

        if(isHorizontal) {
            dir = line.start.x < line.end.x ? 1 : -1;
            const xOffset = this.cellSize * dir;

            p1 = this.points.find(p => p.x == line.start.x + xOffset && p.y == line.start.y);
            p2 = this.points.find(p => p.x == line.start.x + 2 * xOffset && p.y == line.start.y);
        }
        else {
            dir = line.start.y < line.end.y ? 1 : -1;
            const yOffset = this.cellSize * dir;
                
            p1 = this.points.find(p => p.x == line.start.x && p.y == line.start.y + yOffset);
            p2 = this.points.find(p => p.x == line.start.x && p.y == line.start.y + 2 * yOffset);
        }

        if(p1.isAvailable && p2.isAvailable) {
            p1.isAvailable = false;
            p2.isAvailable = false;
        }
        else {
            console.warn('NO DRAWING HERE BUDDY');
            this.lines.pop();
        }

        this.resetGrid();
    }

    resetGrid() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.drawPreviousLines();
        this.drawGridWithPath2D();
    }

    reset() {
        this.direction = '';
        this.drawing = false;
        this.linePos = {x: 0, y: 0};
        this.startPoint = {x: 0, y: 0};
        this.oldX = 0;
        this.oldY = 0;
    }

    drawPoints() {
        const availablePointColor = '#11EE28';
        const unavailablePointColor = 'red';
        const pointRadius = 10;
        const {ctx} = this;

        this.points.forEach((point) => {
            const fillColor = point.isAvailable ? availablePointColor : unavailablePointColor;
            
            ctx.beginPath();
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = 'black';
            ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        });
    }
}