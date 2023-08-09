export class Tile {
    constructor(x, y, path = null) {
        this.x = x;
        this.y = y;
        this.path = path;
        this.east = null;
        this.west = null;
        this.south = null;
        this.north = null;
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
            North: {x: 0, y: -1},
            East: {x: 1, y: 0},
            South: {x: 0, y: 1},
            West: {x: -1, y: 0},
        };
        this.init();
    }

    init() {
        this.generateGrid();
    }

    generateGrid() {
        const {tiles, edges, size, tileSize} = this;

        for (let x = 0; x <= size; x++) {
            tiles[x] = [];
            for (let y = 0; y <= size; y++) {
                if(x < size && y < size) {
                    tiles[x][y] = new Tile(x, y);
                    if(y > 0) {
                        this.makeSouthNorthNeighbors(tiles[x][y], tiles[x][y - 1]);
                        edges.push(new Edge(x, y, 'N', tiles[x][y], tiles[x][y - 1]));
                    }
                    if(x > 0) {
                        this.makeEastWestNeighbors(tiles[x][y], tiles[x - 1][y]);
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

    makeSouthNorthNeighbors(south, north) {
        south.north = north;
        north.south = south;
    }

    makeEastWestNeighbors(east, west) {
        east.west = west;
        west.east = east;
    }

    isIntersecting(x1, x2, y1, y2) {
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

    updateVertices() {
        this.totalLegalMoves = 0;
        this.vertices.forEach((vert) => {
            this.setLegalMoveCount(vert);
        });
        this.totalLegalMoves /= 2;
        console.log(`LEGAL MOVES LEFT: ${this.totalLegalMoves}`);
    }

    setLegalMoveCount(start) {
        let count = 0;
        for(const direction in this.directionMap) {
            const {x, y} = this.directionMap[direction];

            if(x == 0 && (start.x == 0 || start.x == this.size * this.tileSize)) {
                continue;
            }
            else if(y == 0 && (start.y == 0 || start.y == this.size * this.tileSize)) {
                continue;
            }

            let end = this.getVertex(start.x + (3 * this.tileSize * x), start.y + (3 * this.tileSize * y));

            if(end) {
                if(!this.isIntersecting(start.x, end.x, start.y, end.y)) {
                    count++;
                }
            }
        }
        start.moves = count;
        this.totalLegalMoves += count;
    }

    updateGridCollections(line) {
        this.lines.push(line);
        this.updateVertices();
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
}