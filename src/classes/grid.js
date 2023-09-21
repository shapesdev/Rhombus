import { updateLines, isIntersecting } from "../modules/lineHandler.js";
import { isPathPossible } from "../modules/pathfinding.js";
import { Tile } from "./Tile.js";
import { Edge } from "./edge.js";
import { Vertex } from "./vertex.js";

export class Grid {
    constructor(size, tileSize) {
        this.size = size;
        this.tileSize = tileSize;
        this.vertices = [];
        this.tiles = [];
        this.edges = [];
        this.conqueredTiles = [];
        this.totalLegalMoves = 0;
        this.directionMap = {
            N: {x: 0, y: -1},
            E: {x: 1, y: 0},
            S: {x: 0, y: 1},
            W: {x: -1, y: 0},
        };
        this.generate();
    }

    getVertex(x, y) {
        return this.vertices.find(p => p.x == x && p.y == y);
    }

    getTile(x, y) {
        return this.tiles[x][y];
    }
    
    getEdge(x, y, edgeType) {
        return this.edges.find(e => e.x == x && e.y == y && e.edgeType == edgeType);
    }

    getTileNeighbors(tile) {
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

    generate() {
        const {tiles, edges, size, tileSize} = this;

        for (let x = 0; x <= size; x++) {
            if(x < size) {
                tiles[x] = [];
            }
            for (let y = 0; y <= size; y++) {
                if(x < size && y < size) {
                    tiles[x][y] = new Tile(x, y);
                    if(y > 0) {
                        this.makeNeighbors(tiles[x][y], tiles[x][y - 1]);
                        edges.push(new Edge(x, y, 'N', tiles[x][y], tiles[x][y - 1]));
                    }
                    if(x > 0) {
                        this.makeNeighbors(tiles[x][y], tiles[x - 1][y]);
                        edges.push(new Edge(x, y, 'W', tiles[x][y], tiles[x - 1][y]));
                    }
                }
                if(!(x == 0 && y == 0) && !(x == size && y == 0) && !(x == 0 && y == size) && !(x == size && y == size)) {
                    this.vertices.push(new Vertex(x * tileSize, y * tileSize));
                }
            }
        }
        this.updateVertices();
    }

    makeNeighbors(t1, t2) {
        t1.neighbors.push(t2);
        t2.neighbors.push(t1);
    }

    update(line, dir) {
        this.updatePathfinding(line, dir);
        updateLines(line);
        this.updateVertices();
    }

    updatePathfinding(line, dir) {
        const x = line.start.x;
        const y = line.start.y;
        const edgeType = dir.x == 0 ? 'W' : 'N';
        const tempTiles = [];

        for(let i = 0; i <= 2; i++) {
            let newX = (x + i * dir.x * this.tileSize) / this.tileSize;
            let newY = (y + i * dir.y * this.tileSize) / this.tileSize;

            if(dir.y == -1) {
                newY--;
            }
            if(dir.x == -1) {
                newX--;
            }

            const edge = this.getEdge(newX, newY, edgeType);

            edge.tile1.neighbors.splice(edge.tile1.neighbors.indexOf(edge.tile2), 1);
            edge.tile2.neighbors.splice(edge.tile2.neighbors.indexOf(edge.tile1), 1);
            tempTiles.push(edge.tile1);
            tempTiles.push(edge.tile2);
        }
        this.updateConqueredTiles(tempTiles);
    }

    updateConqueredTiles(tiles) {
        for(let i = 0; i < tiles.length; i+=2) {
            if(!isPathPossible(tiles[i], tiles[i + 1])) {
                let arr1 = this.getTileNeighbors(tiles[i]);
                let arr2 = this.getTileNeighbors(tiles[i+1]);
                if(arr1.length != 0 && arr2.length != 0) {
                    this.conqueredTiles = arr1.length < arr2.length ? arr1 : arr2;
                }
            }
        }
    }

    setTilePaths(tileType) {
        for(const tile of this.conqueredTiles) {
            tile.tileType = tileType;
        }

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                this.tiles[x][y].isChecked = false;
            }
        }
        this.conqueredTiles = [];
    }

    updateVertices() {
        this.totalLegalMoves = 0;
        this.vertices.forEach((vert) => {
            this.setLegalMoveCount(vert);
        });
        this.totalLegalMoves /= 2; // Divide it, since it includes both directions
        //console.log(this.totalLegalMoves);
    }

    setLegalMoveCount(vert) {
        let count = 0;
        for(const direction in this.directionMap) {
            const {x, y} = this.directionMap[direction];

            if((x == 0 && (vert.x == 0 || vert.x == this.size * this.tileSize)) ||
               (y == 0 && (vert.y == 0 || vert.y == this.size * this.tileSize))) {
                continue;
            }

            const end = this.getVertex(vert.x + (3 * this.tileSize * x), vert.y + (3 * this.tileSize * y));

            if(end && this.isLineValid(vert.x, end.x, vert.y, end.y, {x, y})) {
                count++;
            }
        }
        vert.moves = count;
        this.totalLegalMoves += count;
    }

    isLineValid(x1, x2, y1, y2, dir) {
        const mid = this.getVertex(x1 + this.tileSize * 2 * dir.x, y1 + this.tileSize * 2 * dir.y);
        return !isIntersecting(x1, x2, y1, y2) && !this.isTileClaimed(mid);
    }

    isTileClaimed(vert) {
        if(vert) {
            let x = vert.x / this.tileSize;
            let y = vert.y / this.tileSize;
            if(x < this.size && y < this.size) {
                if(this.tiles[x][y].tileType != null) {
                    return true;
                }
            }
        }
        return false;
    }
}


    // Likely won't be used // Leaving just in case
/*     updateTilesCombined(tiles) {
        let leftArr = [];
        let rightArr = [];
        for(let i = 0; i < tiles.length; i+=2) {
            if(!isPathPossible(tiles[i], tiles[i + 1])) {
                leftArr = leftArr.concat(this.getTileNeighbors(tiles[i]));
                rightArr = rightArr.concat(this.getTileNeighbors(tiles[i + 1]));
            }
        }
        if(leftArr.length != 0 && rightArr.length != 0) {
            let arr = leftArr.length < rightArr.length ? leftArr : rightArr;
            this.setTilePaths(arr);
        }
    } */