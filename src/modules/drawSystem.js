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
        if(e.buttons !== 1) return;
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
            }
        }
        //this.drawVertices();
        //this.drawVerticesLegalMoves();
    }

    colorTileOnClick(e) {
        const {grid, canvas} = this;

        const x = Math.floor((e.x - canvas.getBoundingClientRect().left) / grid.tileSize);
        const y = Math.floor((e.y - canvas.getBoundingClientRect().top) / grid.tileSize);
        const tile = grid.getTile(x, y);
        canvas.colorPath2D(tile.path, 'rgba(128, 231, 143, 0.9)');
    }

    drawPath2D(e) {
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
        const x = e.x - this.canvas.getBoundingClientRect().left;
        const y = e.y - this.canvas.getBoundingClientRect().top;
        const { direction, startPoint } = this;
    
        if(['E', 'W'].includes(direction)) {
            if(this.linePos.y != this.canvas.height && this.linePos.y != 0 
                && ((direction === 'E' && x >= this.linePos.x) 
                || (direction === 'W' && x <= this.linePos.x))) {

                    this.linePos = { x: x, y: startPoint.y };
            }
        }
        else if(['S', 'N'].includes(direction)) {
            if(this.linePos.x != this.canvas.width && this.linePos.x != 0
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

        if(!this.grid.isLineIntersecting(line.start.x, line.end.x, line.start.y, line.end.y)) {       
            this.lineColor = 'black';
        }
        else {
            this.lineColor = 'red';
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
                length = Math.abs(this.linePos.x - startPoint.x) / maxLineLength;
            }
            else {
                length = Math.abs(this.linePos.y - startPoint.y) / maxLineLength;
            }

            if(length > 0.85 && this.linePos.x <= this.canvas.width && this.linePos.y <= this.canvas.height
                && this.linePos.x >= 0 && this.linePos.y >= 0 && !this.grid.isLineIntersecting(line.start.x, line.end.x, line.start.y, line.end.y)) {
                this.linePos.x = startPoint.x + maxLineLength * dir.x;
                this.linePos.y = startPoint.y + maxLineLength * dir.y;
            
                this.grid.updateCollections(line);
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
        // FOR NOW
        this.drawAStarCosts();
    }

    reset() {
        this.direction = '';
        this.drawing = false;
        this.linePos = {x: 0, y: 0};
        this.startPoint = {x: 0, y: 0};
        this.oldX = 0;
        this.oldY = 0;
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

    drawAStarCosts() {
        for(let x = 0; x < this.grid.size; x++) {
            for(let y = 0; y < this.grid.size; y++) {
                let tile = this.grid.tiles[x][y];
                if(tile != this.grid.startNode && tile != this.grid.endNode) {
                    this.canvas.drawText(tile.x * this.grid.tileSize + 10, tile.y * this.grid.tileSize + 20, tile.g, '#2C3E50');
                    this.canvas.drawText(tile.x * this.grid.tileSize + 70, tile.y * this.grid.tileSize + 20, tile.h, '#2C3E50');
                    this.canvas.drawText(tile.x * this.grid.tileSize + 40, tile.y * this.grid.tileSize + 50, tile.f, '#2C3E50');
                }
            }
        }
    }

    selectTileOnClick(e) {
        const {grid, canvas} = this;

        const x = Math.floor((e.x - canvas.getBoundingClientRect().left) / grid.tileSize);
        const y = Math.floor((e.y - canvas.getBoundingClientRect().top) / grid.tileSize);
        const tile = grid.getTile(x, y);
        grid.startNode = tile;

        let path = grid.getAStarPath();

        path.forEach((p) => {
            this.canvas.colorPath2D(p.path, '#58D68D');
        })
    }
}