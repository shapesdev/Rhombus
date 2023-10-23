import { lines } from './lineHandler.js';
import * as canvas from './canvas.js';
import { size, tiles, tileSize, totalLegalMoves, directionMap, vertices, isLineValid, updateGrid } from './grid.js';

const { canvasElem, ctx } = canvas.create(700, 700);

let maxLineLength = 300;
let curLine = { x: 0, y: 0 };
let startPoint = { x: 0, y: 0 };
let oldX = 0;
let oldY = 0;
let drawing = false;
let direction = '';
let lineColor = 'black';

export function draw(e) {
    if(e.buttons !== 1 || totalLegalMoves == 0) return;
    setDirection(e);
    setStartPoint(e);
    setPosition(e);
    limitLineLength();
    updateLineColor();
    canvas.drawLine(ctx, startPoint, curLine, 3, lineColor);
}

export function setPosition(e) {
    const x = e.x - canvasElem.getBoundingClientRect().left;
    const y = e.y - canvasElem.getBoundingClientRect().top;

    if(['E', 'W'].includes(direction)) {
        if(curLine.y != canvasElem.height && curLine.y != 0 
        && ((direction === 'E' && x >= curLine.x) 
        || (direction === 'W' && x <= curLine.x))) {

            curLine = { x: x, y: startPoint.y };
        }
    }
    else if(['S', 'N'].includes(direction)) {
        if(curLine.x != canvasElem.width && curLine.x != 0
        && ((direction === 'S' && y >= curLine.y) 
        || (direction === 'N' && y <= curLine.y))) {

            curLine = { x: startPoint.x, y: y };
        }
    }
}

export function drawGrid() {
    for(let i = 0; i < size; i++) {
        for(let j = 0; j < size; j++) {
            if(tiles.length > 0 && tiles[i][j]) {
                tiles[i][j].path = canvas.drawPath2D(ctx, i * tileSize, j * tileSize, tileSize, tileSize);
                if(tiles[i][j].tileType) {
                    canvas.colorPath2D(ctx, tiles[i][j].path, tiles[i][j].tileType);
                }
            }
        }
    }
}

export function drawVertices() {
    vertices.forEach((vert) => {
        drawPoint(vert.x, vert.y, 10);
    })
}

export function isDrawSuccessful() {
    let success = false;

    const line = {
        start: {...startPoint},
        end: {...curLine},
    };

    if(direction in directionMap) {
        const dir = directionMap[direction];
        let length;

        if(dir.x !== 0) {
            length = Math.abs(line.end.x - line.start.x) / maxLineLength;
        }
        else {
            length = Math.abs(line.end.y - line.start.y) / maxLineLength;
        }

        if(length > 0.85 && line.end.x <= canvasElem.width && line.end.y <= canvasElem.height
        && line.end.x >= 0 && line.end.y >= 0 && isLineValid(line.start.x, line.end.x, line.start.y, line.end.y, dir)) {          
     
            line.end.x = line.start.x + maxLineLength * dir.x;
            line.end.y = line.start.y + maxLineLength * dir.y;
            updateGrid(line, dir);
            success = true;
        }
        else {
            console.warn('Line is not valid');
        }
    }
    return success;
}

export function reset() {
    ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
    drawGrid();
    drawPreviousLines();

    direction = '';
    drawing = false;
    curLine = {x: 0, y: 0};
    startPoint = {x: 0, y: 0};
    oldX = 0;
    oldY = 0;
}

function drawPath2D(e) {
    const x = Math.floor((e.x - canvasElem.getBoundingClientRect().left) / grid.tileSize);
    const y = Math.floor((e.y - canvasElem.getBoundingClientRect().top) / grid.tileSize);
    const tile = grid.getTile(x, y);
    canvas.drawPoint(tile.x * grid.tileSize + 50, tile.y * grid.tileSize + 50, 8);
}

function drawPreviousLines() {
    if(lines.length > 0) {
        lines.forEach((line) => {
            canvas.drawLine(ctx, line.start, line.end);
        })
    }
}

function setDirection(e) {
    if(direction == '') {
        const x = oldX;
        const y = oldY;

        if(e.pageX > x && e.pageY == y) {
            direction = 'E';
        }
        else if(e.pageX < x && e.pageY == y) {
            direction = 'W';
        }
        else if(e.pageX == x && e.pageY > y) {
            direction = 'S';
        }
        else if(e.pageX == x && e.pageY < y) {
            direction = 'N';
        }
    }
    oldX = e.pageX;
    oldY = e.pageY;
}

function setStartPoint(e) {
    if(!drawing) {
        const x = e.x - canvasElem.getBoundingClientRect().left;
        const y = e.y - canvasElem.getBoundingClientRect().top;
        let minDistance = 1000000;
        let closestPoint;

        vertices.forEach((point) => {
            let distance = Math.sqrt(Math.pow((x - point.x), 2) +
            Math.pow((y - point.y), 2));
            if(distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
            }
        });
        startPoint.x = curLine.x = closestPoint.x;
        startPoint.y = curLine.y = closestPoint.y;
        drawing = true;
    }
}

function limitLineLength() {
    if (curLine.x - startPoint.x > maxLineLength) {
        curLine.x = startPoint.x + maxLineLength;
    } else if (startPoint.x - curLine.x > maxLineLength) {
        curLine.x = startPoint.x - maxLineLength;
    }

    if (curLine.y - startPoint.y > maxLineLength) {
        curLine.y = startPoint.y + maxLineLength;
    } else if (startPoint.y - curLine.y > maxLineLength) {
        curLine.y = startPoint.y - maxLineLength;
    }
}

function updateLineColor() {
    const line = {
        start: {...startPoint},
        end: {...curLine},
    };

    const dir = directionMap[direction];

    if(dir) {
        if(isLineValid(line.start.x, line.end.x, line.start.y, line.end.y, dir)) {       
            lineColor = 'black';
        }
        else {
            lineColor = 'red';
        }
    }
}

function drawPoint(x, y, size = 1) {
    ctx.fillStyle = 'red';  // Set the fill color for the point
    ctx.fillRect(x, y, size, size);  // Fill a rectangle at the specified position
}