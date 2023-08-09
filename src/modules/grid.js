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
                    this.vertices.push({x: x * tileSize, y: y * tileSize, isAvailable : true, isReserved: false, moves: 0});
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

    isLineValid(line) {
        const isHorizontal = line.start.y === line.end.y;
        let p1, p2, p3, p4;
        const xOffset = this.tileSize * (isHorizontal ? (line.start.x < line.end.x ? 1 : -1) : 0);
        const yOffset = this.tileSize * (!isHorizontal ? (line.start.y < line.end.y ? 1 : -1) : 0);

        p1 = this.getVertex(line.start.x, line.start.y);
        p2 = this.getVertex(line.start.x + xOffset, line.start.y + yOffset);
        p3 = this.getVertex(line.start.x + 2 * xOffset, line.start.y + 2 * yOffset);
        p4 = this.getVertex(line.end.x, line.end.y);

        if(p2.isAvailable && p3.isAvailable) {
            p2.isAvailable = false;
            p3.isAvailable = false;
            this.updateVertices();
            return true;
        }
        else {
            return false;
        }
    }

/*     updateVertexCollection() {
        this.vertices.forEach((vertex) =>{
            let count = 0;
            for(const direction in this.directionMap) {
                const {x, y} = this.directionMap[direction];
                
                let p1 = this.getVertex(vertex.x + (1 * this.tileSize * x), vertex.y + (1 * this.tileSize * y));
                let p2 = this.getVertex(vertex.x + (2 * this.tileSize * x), vertex.y + (2 * this.tileSize * y));
                let p3 = this.getVertex(vertex.x + (3 * this.tileSize * x), vertex.y + (3 * this.tileSize * y));
    
                if(p3 &&(!p1.isTaken && !p2.isTaken) && (!p1.isReserved && !p2.isReserved)) {
                    count++;
                }
            }
            if(count == 0) {
                vertex.isReserved = true;
            }
        });
    } */

    updateVertices() {
        this.vertices.forEach((vert) => {
            this.setLegalMoveCount(vert);
        });
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
            
            let p1 = this.getVertex(vert.x + (1 * this.tileSize * x), vert.y + (1 * this.tileSize * y));
            let p2 = this.getVertex(vert.x + (2 * this.tileSize * x), vert.y + (2 * this.tileSize * y));
            let p3 = this.getVertex(vert.x + (3 * this.tileSize * x), vert.y + (3 * this.tileSize * y));

            if(p3 && p1.isAvailable && p2.isAvailable) {
                count++;
            }
        }
        vert.moves = count;
    }

    updateEdgeVertex(vert) {
        if (vert.x === 0 || vert.y === 0 || vert.x === this.size * this.tileSize || vert.y === this.size * this.tileSize) {
            vert.isTaken = true;
        }
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