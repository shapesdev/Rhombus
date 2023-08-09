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

        //this.drawVertices();
        //this.drawEdges();
        //this.drawVerticesLegalMoves();
    }

    colorTile(e) {
        const {grid, canvas} = this;

        const x = Math.floor((e.x - canvas.getBoundingClientRect().left) / grid.tileSize);
        const y = Math.floor((e.y - canvas.getBoundingClientRect().top) / grid.tileSize);
        const tile = grid.getTile(x, y);
        canvas.colorPath2D(tile.path, 'rgba(128, 231, 143, 0.9)');
    }

    drawPath(e) {
        const {grid, canvas} = this;

        const x = Math.floor((e.x - canvas.getBoundingClientRect().left) / grid.tileSize);
        const y = Math.floor((e.y - canvas.getBoundingClientRect().top) / grid.tileSize);
        const tile = grid.getTile(x, y);
        canvas.drawPoint(tile.x * this.grid.tileSize + 50, tile.y * this.grid.tileSize + 50, 8);
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

        if(direction in this.grid.directionMap) {
            const dir = this.grid.directionMap[direction];
            let length;

            if(dir.x !== 0) {
                length = Math.abs(this.linePos.x - startPoint.x) / maxLineLength;
            }
            else {
                length = Math.abs(this.linePos.y - startPoint.y) / maxLineLength;
            }

            if(length > 0.85 && this.linePos.x <= this.canvas.width && this.linePos.y <= this.canvas.height
                && this.linePos.x >= 0 && this.linePos.y >= 0 && !this.grid.isIntersecting(line.start.x, line.end.x, line.start.y, line.end.y)) {
                this.linePos.x = startPoint.x + maxLineLength * dir.x;
                this.linePos.y = startPoint.y + maxLineLength * dir.y;
            
                this.grid.updateGridCollections(line);
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

    drawEdges() {
        this.grid.edges.forEach((edge) => {
            if(edge != null) {
                if(edge.edgeType == 'N') {
                    this.canvas.drawText(edge.x * this.grid.tileSize + 50, edge.y * this.grid.tileSize + 10, 'N');
                }
                else if(edge.edgeType == 'W') {
                    this.canvas.drawText(edge.x * this.grid.tileSize - 10, edge.y * this.grid.tileSize + 50, 'W');
                }
            }
        });
    }

    drawVertices() {
        let fillColor;

        this.grid.vertices.forEach((vertex) => {
            if(vertex.moves == 0) {
                fillColor = 'red';
            }
            else {
                fillColor = '#11EE28';
            }
            this.canvas.drawPoint(vertex.x, vertex.y, 10, fillColor);
        });
    }

    drawVerticesLegalMoves() {
        this.grid.vertices.forEach((vertex) => {
            if(vertex.x > 300 && vertex.y > 100) {
                this.canvas.drawText(vertex.x - 10, vertex.y - 10, vertex.moves);
            }
            else if(vertex.y < 100) {
                this.canvas.drawText(vertex.x, vertex.y + 15, vertex.moves);
            }
            else {
                this.canvas.drawText(vertex.x, vertex.y - 10, vertex.moves);
            }
        });
    }
}