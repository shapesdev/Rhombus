import { updateLines, isIntersecting } from "./lineModule.js";
import { isPathPossible } from "./pathfindingModule.js";
import { Tile } from "../classes/Tile.js";
import { Edge } from "../classes/edge.js";
import { Vertex } from "../classes/vertex.js";

export {size, tiles, tileSize, totalLegalMoves, directionMap, vertices, conqueredTiles};

let size = 7;
let tileSize = 100;
let vertices = [];
let tiles = [];
let edges = [];
let conqueredTiles = [];
let totalLegalMoves = 0;
const directionMap = {
    N: {x: 0, y: -1},
    E: {x: 1, y: 0},
    S: {x: 0, y: 1},
    W: {x: -1, y: 0},
};

export function setupGrid(gridSize, tilesSize) {
    size = gridSize;
    tileSize = tilesSize;
}

export function generateSquareGrid() {
    initGrid();
    for (let x = 0; x <= size; x++) {
        for (let y = 0; y <= size; y++) {
            if(x < size && y < size) {;
                tiles[x][y] = new Tile(x, y);
                if(y > 0) {
                    makeNeighbors(tiles[x][y], tiles[x][y - 1]);
                    edges.push(new Edge(x, y, 'N', tiles[x][y], tiles[x][y - 1]));
                }
                if(x > 0) {
                    makeNeighbors(tiles[x][y], tiles[x - 1][y]);
                    edges.push(new Edge(x, y, 'W', tiles[x][y], tiles[x - 1][y]));
                }
            }
            if(!(x == 0 && y == 0) && !(x == size && y == 0) && !(x == 0 && y == size) && !(x == size && y == size)) {
                vertices.push(new Vertex(x * tileSize, y * tileSize));
            }
        }
    }
    updateLegalMoves();
}

export function generateRhombusGrid() {
    initGrid();
    let mid = Math.floor(size / 2);
    let startIndex = mid;
    let tileCount = 1;
    for (let y = 0; y < size; y++) {
        for(let i = 0, x = startIndex; i < tileCount; i++, x++) {
            tiles[x][y] = new Tile(x, y);
            if(i > 0 && tileCount != 1) {
                makeNeighbors(tiles[x][y], tiles[x - 1][y]);
                edges.push(new Edge(x, y, 'W', tiles[x][y], tiles[x - 1][y]));
            }
            if(y > 0 && (i > 0 || (i == 0 && y > mid))) {
                if(tiles[x][y - 1]) {
                    makeNeighbors(tiles[x][y], tiles[x][y - 1]);
                    edges.push(new Edge(x, y, 'N', tiles[x][y], tiles[x][y - 1]));
                }
            }

             if(y > 0 && x > 0 && (i != 0 && y != 0)) {
                vertices.push(new Vertex(x * tileSize, y * tileSize));
                vertices.push(new Vertex(x * tileSize, (y + 1) * tileSize));
            }
        }
        if(y <= startIndex + 1) {
            tileCount += 2;
            startIndex--;
        }
        else {
            tileCount -= 2;
            startIndex++;
        }
    }
    updateLegalMoves();
}

export function updateGrid(line, dir) {
    updateTiles(line, dir);
    updateLines(line);
}

export function setTilePaths(tileType) {
    for(const tile of conqueredTiles) {
        if(tile != null) {
            tile.tileType = tileType;
        }
    }

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            if(tiles[x][y]) {
                tiles[x][y].isChecked = false;
            }
        }
    }
    conqueredTiles = [];
}

export function updateLegalMoves() {
    totalLegalMoves = 0;
    vertices.forEach((vert) => {
        setLegalMoveCount(vert);
    });
    totalLegalMoves /= 2; // Divide it, since it includes both directions
    //console.log(totalLegalMoves);
}

export function updateConqueredTilesCollection(arr) {
    conqueredTiles = arr;
}

export function isLineValid(x1, x2, y1, y2, dir) {
    const mid = getVertex(x1 + tileSize * 2 * dir.x, y1 + tileSize * 2 * dir.y);
    return !isIntersecting(x1, x2, y1, y2) && !isTileClaimed(mid);
}

function initGrid() {
    for (let x = 0; x < size; x++) {
        tiles[x] = new Array(size);
        for (let y = 0; y < size; y++) {
            tiles[x][y] = null;
        }
    }
}

function getVertex(x, y) {
    return vertices.find(p => p.x == x && p.y == y);
}

function getTile(x, y) {
    return tiles[x][y];
}

function getEdge(x, y, edgeType) {
    return edges.find(e => e.x == x && e.y == y && e.edgeType == edgeType);
}

function getTileNeighbors(tile) {
    const queue = [tile];
    const arr = [];

    while(queue.length > 0) {
        const tile = queue.shift();
        if(!tile.isChecked) {
            tile.isChecked = true;
            arr.push(tile);

            for(const neighbor of tile.neighbors) {
                if(!neighbor.isChecked) {
                    queue.push(neighbor);
                }
            }
        }
    }
    resetCheckValues();
    return arr;
}

function makeNeighbors(t1, t2) {
    t1.neighbors.push(t2);
    t2.neighbors.push(t1);
}

function updateTiles(line, dir) {
    const x = line.start.x;
    const y = line.start.y;
    const edgeType = dir.x == 0 ? 'W' : 'N';
    const tempTiles = [];

    for(let i = 0; i <= 2; i++) {
        let newX = (x + i * dir.x * tileSize) / tileSize;
        let newY = (y + i * dir.y * tileSize) / tileSize;

        if(dir.y == -1) {
            newY--;
        }
        if(dir.x == -1) {
            newX--;
        }
        const edge = getEdge(newX, newY, edgeType);

        edge.tile1.neighbors.splice(edge.tile1.neighbors.indexOf(edge.tile2), 1);
        edge.tile2.neighbors.splice(edge.tile2.neighbors.indexOf(edge.tile1), 1);
        tempTiles.push(edge.tile1);
        tempTiles.push(edge.tile2);
    }
    updateConqueredTiles(tempTiles);
}

function updateConqueredTiles(tiles) {;
    const set = new Set();
    for(let i = 0; i < tiles.length; i+=2) {
        if(!isPathPossible(tiles[i], tiles[i + 1])) {
            const arr1 = getTileNeighbors(tiles[i]);
            const arr2 = getTileNeighbors(tiles[i + 1]);
            if(totalLegalMoves > 1) {
                const arr = arr1.length < arr2.length ? arr1 : arr2;
                arr.forEach(item => set.add(item));
            }
            else {
                set.add(arr1);
                set.add(arr2);
            }
        }
    }
    
    if(totalLegalMoves > 1) {
        if(set.size > 0) {
            conqueredTiles = [...set];
        }
    }
    else {
        let temp = [];
        let shortestLength = Infinity;
        set.forEach((arr) => {
            if(arr.length < shortestLength) {
                shortestLength = arr.length;
                temp = arr;
            }
        });
        conqueredTiles = temp;
    }
}

function setLegalMoveCount(vert) {
    let count = 0;

    for(const direction in directionMap) {
        const {x, y} = directionMap[direction];
        if((x === 0 && (vert.x === 0 || vert.x === size * tileSize)) ||
           (y === 0 && (vert.y === 0 || vert.y === size * tileSize))) {
            continue;
        } 
        const end = getVertex(vert.x + (3 * tileSize * x), vert.y + (3 * tileSize * y));
        if(end && isLineValid(vert.x, end.x, vert.y, end.y, {x, y})) {
            count++;
        }
    }
    vert.moves = count;
    totalLegalMoves += count;
}

function isTileClaimed(vert) {
    if(vert) {
        const x = vert.x / tileSize;
        const y = vert.y / tileSize;
        if(x < size && y < size) {
            if(tiles[x][y] && tiles[x][y].tileType != null) {
                return true;
            }
        }
    }
    return false;
}

function resetCheckValues() {
    for(let i = 0; i < size; i++) {
        for(let j = 0; j < size; j++) {
            if(tiles[i][j]) {
                tiles[i][j].isChecked = false;
            }
        }
    }
}