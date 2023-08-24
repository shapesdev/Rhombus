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
        this.startNode = null;
        this.endNode = null;
        this.init();
    }

    getVertex(x, y) {
        let vert = this.vertices.find(p => p.x == x && p.y == y);
        return vert;
    }

    getTile(x, y) {
        return this.tiles[x][y];
    }
    
    getEdge(x, y, edgeType) {
        return this.edges.find(e => e.x == x && e.y == y && e.edgeType == edgeType);
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
                    this.vertices.push({x: x * tileSize, y: y * tileSize, moves: 0});
                }
            }
        }
        this.updateVertices();
    }

    makeNeighbors(t1, t2) {
        t1.neighbors.push(t2);
        t2.neighbors.push(t1);
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

    updateData(line) {
        this.lines.push(line);
        this.updateVertices();
    }

    updatePathfinding(line, dir) {
        let x = line.start.x;
        let y = line.start.y;
        let edgeType = dir.x == 0 ? 'W' : 'N';

        let markedEdges = [];

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
            markedEdges.push(edge);
        }
        return markedEdges;
    }

    getAStarPath() {
        const closedList = [];
        const openList = [];
        let pathPossible = false;

        openList.push(this.startNode);

        while(openList.length > 0 ) {
            let node = openList[0];
            for(let i = 0; i < openList.length; i++) {
                if(openList[i].f < node.f || (openList[i] == node.f && openList[i].h < node.h)) {
                    node = openList[i];
                }
            }
            openList.splice(openList.indexOf(node), 1);
            closedList.push(node);

            if(node == this.endNode) {
                pathPossible = true;
                break;
            }

            if(node.neighbors.length > 0) {
                node.neighbors.forEach((neighbor) => {
                    if(!closedList.includes(neighbor) && !openList.includes(neighbor)) {
                        neighbor.g = Math.abs(this.startNode.x - neighbor.x) + Math.abs(this.startNode.y - neighbor.y);
                        neighbor.h = Math.abs(this.endNode.x - neighbor.x) + Math.abs(this.endNode.y - neighbor.y);
                        neighbor.f = neighbor.g + neighbor.h;
                        neighbor.nextOnPath = node;
                        if(!openList.includes(neighbor)) {
                            openList.push(neighbor);
                        }
                    }
                });
            }
        }

        if(pathPossible) {
            const shortestPath = [];
            let current = this.endNode;
            while(current !== this.startNode) {
                shortestPath.unshift(current);
                current = current.nextOnPath;
            }
            shortestPath.unshift(this.startNode);
            return shortestPath;
        }
        else {
            return [];
        }
    }

    updateVertices() {
        this.totalLegalMoves = 0;
        this.vertices.forEach((vert) => {
            this.setLegalMoveCount(vert);
        });
        this.totalLegalMoves /= 2; // Divide it, since it includes both directions
        //console.log(`POSSIBLE MOVES LEFT: ${this.totalLegalMoves}`);
    }

    setLegalMoveCount(vert) {
        let count = 0;
        for(const direction in this.directionMap) {
            const {x, y} = this.directionMap[direction];

            if(x == 0 && (vert.x == 0 || vert.x == this.size * this.tileSize)) {
                continue;
            }
            else if(y == 0 && (vert.y == 0 || vert.y == this.size * this.tileSize)) {
                continue;
            }

            let end = this.getVertex(vert.x + (3 * this.tileSize * x), vert.y + (3 * this.tileSize * y));

            if(end) {
                if(!this.isLineIntersecting(vert.x, end.x, vert.y, end.y)) {
                    count++;
                }
            }
        }
        vert.moves = count;
        this.totalLegalMoves += count;
    }
}