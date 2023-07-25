import { Canvas } from "./canvas.js";

const canvas = new Canvas();

const directionMap = {
    North: {x: 0, y: -1},
    East: {x: 1, y: 0},
    South: {x: 0, y: 1},
    West: {x: -1, y: 0},
};

export class Grid {
    constructor() {
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

    init(canvasWidth, canvasHeight, gridSize, tileSize) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.gridSize = gridSize;
        this.tileSize = tileSize;

        canvas.init(canvasWidth, canvasHeight);
        this.generateGrid();
    }
    
    generateGrid() {
        const isCollectionEmpty = this.points.length === 0;

        for(let i = 0; i <= this.gridSize; i++) {
            for(let j = 0; j <= this.gridSize; j++) {
                if(i < this.gridSize && j < this.gridSize) {
                    canvas.drawPath2D(i * this.tileSize, j * this.tileSize,
                         this.tileSize, this.tileSize);
                }
                if(isCollectionEmpty) {
                    if ((i === 0 || i === this.gridSize) && (j === 0 || j === this.gridSize)) {
                        continue;
                    }
                    else {
                        this.points.push({x: i * this.tileSize, y: j * this.tileSize, isAvailable: true});
                    }
                }
            }
        }
        this.generateCorners();
    }

    generatePreviousLines() {
        if(this.lines.length > 0) {
            this.lines.forEach((line) => {
                canvas.drawLine(line.start, line.end);
            })
        }
    }
    
    draw(e) {
        if(e.buttons !== 1) return;
        this.setDirection(e);
        this.setStartPoint(e);
        this.setPosition(e);
        this.limitLineLength();
        canvas.drawLine(this.startPoint, this.linePos);
    }
    
    setPosition(e) {
        const x = e.x - canvas.getBoundingClientRect().left;
        const y = e.y - canvas.getBoundingClientRect().top;
        const { direction, canvasHeight, canvasWidth, startPoint } = this;
    
        if(['East', 'West'].includes(direction)) {
            if(this.linePos.y != canvasHeight && this.linePos.y != 0 
                && ((direction === 'East' && x >= this.linePos.x) 
                || (direction === 'West' && x <= this.linePos.x))) {

                    this.linePos = { x: x, y: startPoint.y };
            }
        }
        else if(['South', 'North'].includes(direction)) {
            if(this.linePos.x != canvasWidth && this.linePos.x != 0
                && ((direction === 'South' && y >= this.linePos.y) 
                || (direction === 'North' && y <= this.linePos.y))) {

                this.linePos = { x: startPoint.x, y: y };
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
            const x = e.x - canvas.getBoundingClientRect().left;
            const y = e.y - canvas.getBoundingClientRect().top;
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
        const { startPoint, maxLineLength } = this;

        if (this.linePos.x - startPoint.x > maxLineLength) {
            this.linePos.x = startPoint.x + maxLineLength;
        } else if (startPoint.x - this.linePos.x > maxLineLength) {
            this.linePos.x = startPoint.x - maxLineLength;
        }

        if (this.linePos.y - startPoint.y > maxLineLength) {
            this.linePos.y = startPoint.y + maxLineLength;
        } else if (startPoint.y - this.linePos.y > maxLineLength) {
            this.linePos.y = startPoint.y - maxLineLength;
        }
    }

    completeDraw() {
        this.validateLine();
        this.resetDrawing();
    }

    validateLine() {
        const {direction, startPoint, maxLineLength, canvasWidth, canvasHeight} = this;

        const line = {
            start: {...startPoint},
            end: {...this.linePos},
        };

        if(direction in directionMap) {
            const dir = directionMap[direction];
            let length;

            if(dir.x !== 0) {
                length = Math.abs(this.linePos.x - startPoint.x) / maxLineLength;
            }
            else {
                length = Math.abs(this.linePos.y - startPoint.y) / maxLineLength;
            }

            if(length > 0.85 && this.linePos.x <= canvasWidth && this.linePos.y <= canvasHeight
                && this.linePos.x >= 0 && this.linePos.y >= 0) {
                this.linePos.x = startPoint.x + maxLineLength * dir.x;
                this.linePos.y = startPoint.y + maxLineLength * dir.y;
                
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

        let startPoint = this.points.find(p => p.x == line.start.x && p.y == line.start.y);
        let endPoint = this.points.find(p => p.x == line.end.x && p.y == line.end.y);

        if(isHorizontal) {
            dir = line.start.x < line.end.x ? 1 : -1;
            const xOffset = this.tileSize * dir;

            p1 = this.points.find(p => p.x == line.start.x + xOffset && p.y == line.start.y);
            p2 = this.points.find(p => p.x == line.start.x + 2 * xOffset && p.y == line.start.y);
        }
        else {
            dir = line.start.y < line.end.y ? 1 : -1;
            const yOffset = this.tileSize * dir;
                
            p1 = this.points.find(p => p.x == line.start.x && p.y == line.start.y + yOffset);
            p2 = this.points.find(p => p.x == line.start.x && p.y == line.start.y + 2 * yOffset);
        }

        if(p1.isAvailable && p2.isAvailable) {
            p1.isAvailable = false;
            p2.isAvailable = false;

            // Update start point if touching edge
            this.updateEdgePoint(startPoint);
            this.updateEdgePoint(endPoint);
        }
        else {
            console.warn('No drawing here, buddy');
            this.lines.pop();
        }
        this.updateLegalPoints(startPoint);
        this.updateLegalPoints(endPoint);
        this.resetGrid();
    }

    updateEdgePoint(point) {
        if (point.x === 0 || point.y === 0 || point.x === this.canvasWidth || point.y === this.canvasHeight) {
            point.isAvailable = false;
        }
    }

    updateLegalPoints(point) {
        // North -> East -> South -> West
        let count = 0;
        for(const direction in directionMap) {
            const {x, y} = directionMap[direction];
            
            // Rule 1
            let p1 = this.points.find(p => p.x == point.x + (100 * x)
            && p.y == point.y + (100 * y));
            let p2 = this.points.find(p => p.x == point.x + (200 * x)
            && p.y == point.y + (200 * y));
            // Rule 2
            let p3 = this.points.find(p => p.x == point.x + (this.maxLineLength * x)
                                    && p.y == point.y + (this.maxLineLength * y));

            if(p3 && p1.isAvailable && p2.isAvailable) {
                count++;
            }
        }
        if(count == 0) {
            point.isAvailable = false;
        }
    }

    resetGrid() {
        canvas.clear();
        this.generatePreviousLines();
        this.generateGrid();
    }

    resetDrawing() {
        this.direction = '';
        this.drawing = false;
        this.linePos = {x: 0, y: 0};
        this.startPoint = {x: 0, y: 0};
        this.oldX = 0;
        this.oldY = 0;
    }

    generateCorners() {
        const availablePointColor = '#11EE28';
        const unavailablePointColor = 'red';

        this.points.forEach((point) => {
            const fillColor = point.isAvailable ? availablePointColor : unavailablePointColor;
            canvas.drawPoint(point, 10, fillColor);
        });
    }
}