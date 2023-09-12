export class Tile {
    constructor(x, y, path = null) {
        this.x = x;
        this.y = y;
        this.path = path;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.nextOnPath = null;
        this.neighbors = [];
        this.isChecked = false;
        this.isFilled = false;
    }
}

export class Edge {
    constructor(x, y, edgeType, tile1, tile2) {
        this.x = x;
        this.y = y;
        this.edgeType = edgeType;
        this.tile1 = tile1;
        this.tile2 = tile2;
    }
}

export class Vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.moves = 0;
        this.hasLine = false;
    }
}


export class Grid {
    constructor(size, tileSize) {
        this.size = size;
        this.tileSize = tileSize;
        this.vertices = [];
        this.tiles = [];
        this.edges = [];
        this.lines = [];
        this.totalLegalMoves = 0;
        this.directionMap = {
            N: {x: 0, y: -1},
            E: {x: 1, y: 0},
            S: {x: 0, y: 1},
            W: {x: -1, y: 0},
        };
        this.init();
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

    init() {
        this.generate();
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
        this.lines.push(line);
        this.checkPathfinding(line, dir);
        this.updateVertices();
    }

    checkPathfinding(line, dir) {
        let x = line.start.x;
        let y = line.start.y;
        let edgeType = dir.x == 0 ? 'W' : 'N';
        let tempTiles = [];

        for(let i = 0; i <= 2; i++) {
            let newX = (x + i * dir.x * this.tileSize) / this.tileSize;
            let newY = (y + i * dir.y * this.tileSize) / this.tileSize;

            if(dir.y == -1) {
                newY--;
            }
            if(dir.x == -1) {
                newX--;
            }

            let edge = this.getEdge(newX, newY, edgeType);

            edge.tile1.neighbors.splice(edge.tile1.neighbors.indexOf(edge.tile2), 1);
            edge.tile2.neighbors.splice(edge.tile2.neighbors.indexOf(edge.tile1), 1);
            tempTiles.push(edge.tile1);
            tempTiles.push(edge.tile2);
        }
        this.updateTilesSeparately(tempTiles);
    }

    updateTilesSeparately(tempTiles) {
        for(let i = 0; i < tempTiles.length; i+=2) {
            if(!this.isPathPossible(tempTiles[i], tempTiles[i + 1])) {
                let arr1 = this.getTileNeighbors(tempTiles[i]);
                let arr2 = this.getTileNeighbors(tempTiles[i+1]);
                if(arr1.length != 0 && arr2.length != 0) {
                    let arr = arr1.length < arr2.length ? arr1 : arr2;
                    console.log(`smaller array length is: ${arr.length}`)
                    this.updateTilePaths(arr);
                }
            }
        }
    }

    updateTilesCombined(tempTiles) {
        let leftArr = [];
        let rightArr = [];

        for(let i = 0; i < tempTiles.length; i+=2) {
            if(!this.isPathPossible(tempTiles[i], tempTiles[i + 1])) {
                leftArr = leftArr.concat(this.getTileNeighbors(tempTiles[i]));
                rightArr = rightArr.concat(this.getTileNeighbors(tempTiles[i + 1]));
            }
        }
        if(leftArr.length != 0 && rightArr.length != 0) {
            let arr = leftArr.length < rightArr.length ? leftArr : rightArr;
            this.updateTilePaths(arr);
        }
    }

        
    updateTilePaths(arr) {
        for(const tile of arr) {
            tile.isFilled = true;
        }

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                this.tiles[x][y].isChecked = false;
            }
        }
    }

    updateVertices() {
        this.totalLegalMoves = 0;
        this.vertices.forEach((vert) => {
            this.setLegalMoveCount(vert);
        });
        this.totalLegalMoves /= 2; // Divide it, since it includes both directions
        //console.log(this.totalLegalMoves);
    }

    isPathPossible(startNode, endNode) {
        const closedList = [];
        const openList = [];
        let pathPossible = false;

        openList.push(startNode);

        while(openList.length > 0 ) {
            let node = openList[0];
            for(let i = 0; i < openList.length; i++) {
                if(openList[i].f < node.f || (openList[i] == node.f && openList[i].h < node.h)) {
                    node = openList[i];
                }
            }
            openList.splice(openList.indexOf(node), 1);
            closedList.push(node);

            if(node == endNode) {
                pathPossible = true;
                break;
            }

            if(node.neighbors.length > 0) {
                node.neighbors.forEach((neighbor) => {
                    if(!closedList.includes(neighbor) && !openList.includes(neighbor)) {
                        neighbor.g = Math.abs(startNode.x - neighbor.x) + Math.abs(startNode.y - neighbor.y);
                        neighbor.h = Math.abs(endNode.x - neighbor.x) + Math.abs(endNode.y - neighbor.y);
                        neighbor.f = neighbor.g + neighbor.h;
                        neighbor.nextOnPath = node;
                        if(!openList.includes(neighbor)) {
                            openList.push(neighbor);
                        }
                    }
                });
            }
        }
        return pathPossible;
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
        return !this.isLineIntersecting(x1, x2, y1, y2) && !this.isWithinFilledArea(mid);
    }

    isLineIntersecting(x1, x2, y1, y2) {
        let intersecting = false;
        let x3, x4, y3, y4;
        if(this.lines.length > 0) {
            this.lines.forEach((l) => {
                x3 = l.start.x;
                y3 = l.start.y;
                x4 = l.end.x;
                y4 = l.end.y;

                if(Math.max(x1, x2) > Math.min(x3, x4) &&
                   Math.min(x1, x2) < Math.max(x3, x4) && y1 == y3 && y2 == y4) {
                    intersecting = true;
                }
                else if(Math.max(y1, y2) > Math.min(y3, y4) &&
                        Math.min(y1, y2) < Math.max(y3, y4) && x1 == x3 && x2 == x4) {
                    intersecting = true;
                }
        
                let t = ((x1 - x3)*(y3 - y4) - (y1 - y3)*(x3 - x4)) /
                ((x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4));
                
                let u = ((x1 - x3)*(y1 - y2) - (y1 - y3)*(x1 - x2)) /
                ((x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4));
        

                if(t > 0 && t < 1 && u > 0 && u < 1) {
                    intersecting = true;
                }
            });
        }
        return intersecting;
    }

    isWithinFilledArea(vert) {
        if(vert) {
            let x = vert.x / this.tileSize;
            let y = vert.y / this.tileSize;
            if(x < this.size && y < this.size) {
                if(this.tiles[x][y].isFilled) {
                    return true;
                }
            }
        }
        return false;
    }
}