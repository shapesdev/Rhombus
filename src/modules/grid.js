import { updateLines, isIntersecting } from "./lineHandler.js";
import { isPathPossible } from "./pathfinding.js";
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

export function generate() {
    for (let x = 0; x <= size; x++) {
        if(x < size) {
            tiles[x] = [];
        }
        for (let y = 0; y <= size; y++) {
            if(x < size && y < size) {
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

export function update(line, dir) {
    updateTiles(line, dir);
    updateLines(line);
}

export function setTilePaths(tileType) {
    for(const tile of conqueredTiles) {
        tile.tileType = tileType;
    }

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            tiles[x][y].isChecked = false;
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

export function isLineValid(x1, x2, y1, y2, dir) {
    const mid = getVertex(x1 + tileSize * 2 * dir.x, y1 + tileSize * 2 * dir.y);
    return !isIntersecting(x1, x2, y1, y2) && !isTileClaimed(mid);
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
    updateConqueredTilesCombined(tempTiles);
    //updateConqueredTiles(tempTiles);
}

function updateConqueredTiles(tiles) {
    for(let i = 0; i < tiles.length; i+=2) {
        if(!isPathPossible(tiles[i], tiles[i + 1])) {
            let arr1 = getTileNeighbors(tiles[i]);
            let arr2 = getTileNeighbors(tiles[i+1]);
            if(arr1.length != 0 && arr2.length != 0) {
                conqueredTiles = arr1.length < arr2.length ? arr1 : arr2;
            }
        }
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
        let x = vert.x / tileSize;
        let y = vert.y / tileSize;
        if(x < size && y < size) {
            if(tiles[x][y].tileType != null) {
                return true;
            }
        }
    }
    return false;
}

function updateConqueredTilesCombined(tiles) {
    let leftArr = [];
    let rightArr = [];
    for(let i = 0; i < tiles.length; i+=2) {
        if(!isPathPossible(tiles[i], tiles[i + 1])) {
            leftArr = leftArr.concat(getTileNeighbors(tiles[i]));
            rightArr = rightArr.concat(getTileNeighbors(tiles[i + 1]));
        }
    }
    if(leftArr.length != 0 && rightArr.length != 0) {
        let arr = leftArr.length < rightArr.length ? leftArr : rightArr;
        conqueredTiles = arr;
    }
}