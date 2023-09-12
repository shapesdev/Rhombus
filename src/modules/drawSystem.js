import { Canvas } from "./canvas.js";
import { Grid } from "./grid.js";

export class DrawSystem {
    constructor() {
        this.canvas = null;
        this.grid = null;
        this.maxLineLength = 300;
        this.linePos = { x: 0, y: 0 };
        this.startPoint = { x: 0, y: 0 };
        this.oldX = 0;
        this.oldY = 0;
        this.drawing = false;
        this.direction = '';
        this.lineColor = 'black';
    }

    init(canvasWidth, canvasHeight, gridSize, tileSize) {
        this.grid = new Grid(gridSize, tileSize);
        this.canvas = new Canvas(canvasWidth, canvasHeight);
        this.drawGrid();
    }
    
    draw(e) {
        if(e.buttons !== 1 || this.grid.totalLegalMoves == 0) return;
        this.setDirection(e);
        this.setStartPoint(e);
        this.setPosition(e);
        this.limitLineLength();
        this.updateLineColor();
        this.canvas.drawLine(this.startPoint, this.linePos, 5, this.lineColor);
    }

    drawGrid() {
        const {grid, canvas} = this;

        for(let i = 0; i < grid.size; i++) {
            for(let j = 0; j < grid.size; j++) {
                grid.tiles[i][j].path = canvas.drawPath2D(i * grid.tileSize, j * grid.tileSize, grid.tileSize, grid.tileSize);
                if(grid.tiles[i][j].isFilled) {
                    canvas.colorPath2D(grid.tiles[i][j].path, 'rgba(128, 231, 143, 0.9)');
                }
                else if(grid.totalLegalMoves == 0) {
                    canvas.colorPath2D(grid.tiles[i][j].path, 'rgba(230, 120, 143, 0.9)');
                }
            }
        }
    }

    drawPath2D(e) {
        const {grid, canvas} = this;

        const x = Math.floor((e.x - canvas.getBoundingClientRect().left) / grid.tileSize);
        const y = Math.floor((e.y - canvas.getBoundingClientRect().top) / grid.tileSize);
        const tile = grid.getTile(x, y);
        canvas.drawPoint(tile.x * grid.tileSize + 50, tile.y * grid.tileSize + 50, 8);
    }

    drawPreviousLines() {
        if(this.grid.lines.length > 0) {
            this.grid.lines.forEach((line) => {
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
                this.direction = 'E';
            }
            else if(pageX < x && pageY == y) {
                this.direction = 'W';
            }
            else if(pageX == x && pageY > y) {
                this.direction = 'S';
            }
            else if(pageX == x && pageY < y) {
                this.direction = 'N';
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
        const { direction, startPoint, canvas } = this;

        const x = e.x - canvas.getBoundingClientRect().left;
        const y = e.y - canvas.getBoundingClientRect().top;
    
        if(['E', 'W'].includes(direction)) {
            if(this.linePos.y != canvas.height && this.linePos.y != 0 
            && ((direction === 'E' && x >= this.linePos.x) 
            || (direction === 'W' && x <= this.linePos.x))) {

                this.linePos = { x: x, y: startPoint.y };
            }
        }
        else if(['S', 'N'].includes(direction)) {
            if(this.linePos.x != canvas.width && this.linePos.x != 0
            && ((direction === 'S' && y >= this.linePos.y) 
            || (direction === 'N' && y <= this.linePos.y))) {

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

    updateLineColor() {
        const {startPoint} = this;

        const line = {
            start: {...startPoint},
            end: {...this.linePos},
        };

        const dir = this.grid.directionMap[this.direction];

        if(dir) {
            if(this.grid.isLineValid(line.start.x, line.end.x, line.start.y, line.end.y, dir)) {       
                this.lineColor = 'black';
            }
            else {
                this.lineColor = 'red';
            }
        }
    }

    validateLine() {
        const {direction, startPoint, maxLineLength } = this;

        const line = {
            start: {...startPoint},
            end: {...this.linePos},
        };

        if(direction in this.grid.directionMap) {
            const dir = this.grid.directionMap[direction];
            let length;

            if(dir.x !== 0) {
                length = Math.abs(line.end.x - line.start.x) / maxLineLength;
            }
            else {
                length = Math.abs(line.end.y - line.start.y) / maxLineLength;
            }

            if(length > 0.85 && line.end.x <= this.canvas.width && line.end.y <= this.canvas.height
            && line.end.x >= 0 && line.end.y >= 0 && this.grid.isLineValid(line.start.x, line.end.x, line.start.y, line.end.y, dir)) {          
         
                line.end.x = line.start.x + maxLineLength * dir.x;
                line.end.y = line.start.y + maxLineLength * dir.y;
                this.grid.update(line, dir);
            }
            else {
                console.warn('Line is not valid');
            }
            this.clear();
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
}