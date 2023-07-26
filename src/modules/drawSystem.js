import { Canvas } from "./canvas.js";
import { Grid } from "./grid.js";

const directionMap = {
    North: {x: 0, y: -1},
    East: {x: 1, y: 0},
    South: {x: 0, y: 1},
    West: {x: -1, y: 0},
};

export class DrawSystem {
    constructor() {
        this.canvas = null;
        this.grid = null;
        this.maxLineLength = 300;
        this.lines = [];
        this.linePos = { x: 0, y: 0 };
        this.startPoint = { x: 0, y: 0 };
        this.oldX = 0;
        this.oldY = 0;
        this.drawing = false;
        this.direction = '';
    }

    init(canvasWidth, canvasHeight, gridSize, tileSize) {
        this.grid = new Grid(gridSize, tileSize);
        this.canvas = new Canvas(canvasWidth, canvasHeight);
        this.drawGrid();
    }
    
    draw(e) {
        if(e.buttons !== 1) return;
        this.setDirection(e);
        this.setStartPoint(e);
        this.setPosition(e);
        this.limitLineLength();
        this.canvas.drawLine(this.startPoint, this.linePos);
    }

    drawGrid() {
        const {grid, canvas} = this;

        for(let i = 0; i < grid.size; i++) {
            for(let j = 0; j < grid.size; j++) {
                grid.tiles[i][j].path = canvas.drawPath2D(i * grid.tileSize, j * grid.tileSize, grid.tileSize, grid.tileSize);
            }
        }
        //this.drawCorners();
    }

    colorTile(e) {
        const x = Math.floor((e.x - canvas.getBoundingClientRect().left) / this.grid.tileSize);
        const y = Math.floor((e.y - canvas.getBoundingClientRect().top) / this.grid.tileSize);
        let tile = this.grid.getTile(x, y);
        this.canvas.colorPath2D(tile.path, 'rgba(128, 231, 143, 0.9)');
    }

    drawPreviousLines() {
        if(this.lines.length > 0) {
            this.lines.forEach((line) => {
                this.canvas.drawLine(line.start, line.end);
            })
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
    
            this.grid.vertices.forEach((point) => {
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

    setPosition(e) {
        const x = e.x - this.canvas.getBoundingClientRect().left;
        const y = e.y - this.canvas.getBoundingClientRect().top;
        const { direction, startPoint } = this;
    
        if(['East', 'West'].includes(direction)) {
            if(this.linePos.y != this.canvas.height && this.linePos.y != 0 
                && ((direction === 'East' && x >= this.linePos.x) 
                || (direction === 'West' && x <= this.linePos.x))) {

                    this.linePos = { x: x, y: startPoint.y };
            }
        }
        else if(['South', 'North'].includes(direction)) {
            if(this.linePos.x != this.canvas.width && this.linePos.x != 0
                && ((direction === 'South' && y >= this.linePos.y) 
                || (direction === 'North' && y <= this.linePos.y))) {

                this.linePos = { x: startPoint.x, y: y };
            }
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

    complete() {
        this.validateLine();
        this.reset();
    }

    validateLine() {
        const {direction, startPoint, maxLineLength } = this;

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

            if(length > 0.85 && this.linePos.x <= this.canvas.width && this.linePos.y <= this.canvas.height
                && this.linePos.x >= 0 && this.linePos.y >= 0) {
                this.linePos.x = startPoint.x + maxLineLength * dir.x;
                this.linePos.y = startPoint.y + maxLineLength * dir.y;
                
                this.lines.push(line);
                this.updateDrawPoints(line);
            }
            else {
                console.warn('Line was too short');
                this.clear();
            }
        }
    }

    updateDrawPoints(line) {
        const isHorizontal = line.start.y === line.end.y;
        let p1, p2;
        const xOffset = this.grid.tileSize * (isHorizontal ? (line.start.x < line.end.x ? 1 : -1) : 0);
        const yOffset = this.grid.tileSize * (!isHorizontal ? (line.start.y < line.end.y ? 1 : -1) : 0);

        let startPoint = this.grid.getVertex(line.start.x, line.start.y);
        let endPoint = this.grid.getVertex(line.end.x, line.end.y);

        p1 = this.grid.getVertex(line.start.x + xOffset, line.start.y + yOffset);
        p2 = this.grid.getVertex(line.start.x + 2 * xOffset, line.start.y + 2 * yOffset);

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
        this.clear();
    }

    updateEdgePoint(point) {
        if (point.x === 0 || point.y === 0 || point.x === this.canvas.width || point.y === this.canvas.height) {
            point.isAvailable = false;
        }
    }

    updateLegalPoints(point) {
        // North -> East -> South -> West
        if(point) {
            let count = 0;
            for(const direction in directionMap) {
                const {x, y} = directionMap[direction];
                
                let p1 = this.grid.getVertex(point.x + (100 * x), point.y + (100 * y));
                let p2 = this.grid.getVertex(point.x + (200 * x), point.y + (200 * y));
                let p3 = this.grid.getVertex(point.x + (this.maxLineLength * x), point.y + (this.maxLineLength * y));
    
                if(p3 && p1.isAvailable && p2.isAvailable) {
                    count++;
                }
            }
            if(count == 0) {
                point.isAvailable = false;
            }
        }
    }

    clear() {
        this.canvas.clear();
        this.drawPreviousLines();
        this.drawGrid();
    }

    reset() {
        this.direction = '';
        this.drawing = false;
        this.linePos = {x: 0, y: 0};
        this.startPoint = {x: 0, y: 0};
        this.oldX = 0;
        this.oldY = 0;
    }

    drawCorners() {
        const availablePointColor = '#11EE28';
        const unavailablePointColor = 'red';

        this.grid.vertices.forEach((point) => {
            const fillColor = point.isAvailable ? availablePointColor : unavailablePointColor;
            this.canvas.drawPoint(point, 10, fillColor);
        });
    }
}