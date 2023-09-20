class Tile {
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
        this.tileType = null;
    }
}

class Edge {
    constructor(x, y, edgeType, tile1, tile2) {
        this.x = x;
        this.y = y;
        this.edgeType = edgeType;
        this.tile1 = tile1;
        this.tile2 = tile2;
    }
}

class Vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.moves = 0;
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
        this.conqueredTiles = [];
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
        this.updatePathfinding(line, dir);
        this.updateLines(line);
        this.updateVertices();
    }

    updateLines(line) {
        const horizontalLines = [];
        const verticalLines = [];
        this.lines.push(line);

        this.lines.forEach((line) => {
            if (line.start.x === line.end.x) {
                verticalLines.push(line);
            } else {
                horizontalLines.push(line);
            }
        });
        this.lines = [];

        // Sort and merge horizontal lines
        horizontalLines.sort((line1, line2) => line1.start.y - line2.start.y);
        for (let i = 0; i < horizontalLines.length - 1; i++) {
            const prevLine = horizontalLines[i];
            const nextLine = horizontalLines[i+1];

            if (prevLine.start.y === nextLine.end.y &&
            (
                nextLine.start.x === prevLine.end.x || nextLine.end.x === prevLine.start.x ||
                nextLine.start.x === prevLine.start.x || nextLine.end.x === prevLine.end.x
            )) {
                // Lines are adjacent, merge them
                if(nextLine.end.x === prevLine.end.x) {
                    nextLine.end = prevLine.start;
                }
                else if(nextLine.start.x === prevLine.start.x) {
                    nextLine.start = prevLine.end;
                }
                else if(nextLine.end.x === prevLine.start.x) {
                    nextLine.end = prevLine.end;
                }
                else {
                    nextLine.start = prevLine.start;
                }
                horizontalLines.splice(i, 1);
            }
        }

        // Sort and merge vertical lines
        verticalLines.sort((line1, line2) => line1.start.x - line2.start.x);
        for (let i = 0; i < verticalLines.length - 1; i++) {
            const prevLine = verticalLines[i];
            const nextLine = verticalLines[i + 1];

            if (nextLine.start.x === prevLine.end.x &&
            (
                nextLine.start.y === prevLine.end.y || nextLine.end.y === prevLine.start.y ||
                nextLine.start.y === prevLine.start.y || nextLine.end.y === prevLine.end.y
            )) {
                // Lines are adjacent, merge them
                if(nextLine.end.y === prevLine.end.y) {
                    nextLine.end = prevLine.start;
                }
                else if(nextLine.start.y === prevLine.start.y) {
                    nextLine.start = prevLine.end;
                }
                else if(nextLine.end.y === prevLine.start.y) {
                    nextLine.end = prevLine.end;
                }
                else {
                    nextLine.start = prevLine.start;
                }
                verticalLines.splice(i, 1);
            }
        }
        this.lines = [...verticalLines, ...horizontalLines];
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
        this.updateTilesSeparately(tempTiles);
    }

    updateTilesSeparately(tiles) {
        for(let i = 0; i < tiles.length; i+=2) {
            if(!this.isPathPossible(tiles[i], tiles[i + 1])) {
                let arr1 = this.getTileNeighbors(tiles[i]);
                let arr2 = this.getTileNeighbors(tiles[i+1]);
                if(arr1.length != 0 && arr2.length != 0) {
                    this.conqueredTiles = arr1.length < arr2.length ? arr1 : arr2;
                }
            }
        }
    }

    updateTilesCombined(tiles) {
        let leftArr = [];
        let rightArr = [];
        for(let i = 0; i < tiles.length; i+=2) {
            if(!this.isPathPossible(tiles[i], tiles[i + 1])) {
                leftArr = leftArr.concat(this.getTileNeighbors(tiles[i]));
                rightArr = rightArr.concat(this.getTileNeighbors(tiles[i + 1]));
            }
        }
        if(leftArr.length != 0 && rightArr.length != 0) {
            let arr = leftArr.length < rightArr.length ? leftArr : rightArr;
            this.setTilePaths(arr);
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
                if(this.tiles[x][y].tileType != null) {
                    return true;
                }
            }
        }
        return false;
    }
}