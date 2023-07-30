export class Tile {
    constructor(x, y, path = null) {
        this.x = x;
        this.y = y;
        this.path = path
        this.east = null;
        this.west = null;
        this.south = null;
        this.north = null;
    }
}
export class Grid {
    constructor(size, tileSize) {
        this.size = size;
        this.tileSize = tileSize;
        this.vertices = [];
        this.tiles = [];
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
        const {tiles, size, tileSize} = this;

        for (let i = 0; i <= size; i++) {
            tiles[i] = [];
            for (let j = 0; j <= size; j++) {
                if(i < size && j < size) {
                    tiles[i][j] = new Tile(i, j);
                    if(j > 0) {
                        this.makeSouthNorthNeighbors(tiles[i][j], tiles[i][j - 1]);
                    }
                    if(i > 0) {
                        this.makeEastWestNeighbors(tiles[i][j], tiles[i - 1][j]);
                    }
                }
                if(!(i == 0 && j == 0) && !(i == size && j == 0) && !(i == 0 && j == size) && !(i == size && j == size)) {
                    this.vertices.push({x: i * tileSize, y: j * tileSize, isTaken: false, isReserved: false});
                }
            }
        }
    }

    makeSouthNorthNeighbors(south, north) {
        south.north = north;
        north.south = south;
    }

    makeEastWestNeighbors(east, west) {
        east.west = west;
        west.east = east;
    }

    updatePoints(line) {
        const isHorizontal = line.start.y === line.end.y;
        let p1, p2, p3, p4;
        const xOffset = this.tileSize * (isHorizontal ? (line.start.x < line.end.x ? 1 : -1) : 0);
        const yOffset = this.tileSize * (!isHorizontal ? (line.start.y < line.end.y ? 1 : -1) : 0);

        p1 = this.getVertex(line.start.x, line.start.y);
        p2 = this.getVertex(line.start.x + xOffset, line.start.y + yOffset);
        p3 = this.getVertex(line.start.x + 2 * xOffset, line.start.y + 2 * yOffset);
        p4 = this.getVertex(line.end.x, line.end.y);

        if(!p2.isTaken && !p3.isTaken) {
            p2.isTaken = true;
            p3.isTaken = true;

            this.updateEdgeVertex(p1);
            this.updateEdgeVertex(p4);
            //this.updateVertexCollection();
        }
        else {
            console.warn("Can't draw here, mate");
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
    
                if(p3 && !p1.isTaken && !p2.isTaken && !p3.isTaken) {
                    count++;
                }
            }
            if(count == 0) {
                vertex.isReserved = true;
            }
        });
    } */

    updateEdgeVertex(vertex) {
        if (vertex.x === 0 || vertex.y === 0 || vertex.x === this.size * this.tileSize || vertex.y === this.size * this.tileSize) {
            vertex.isTaken = true;
        }
    }

    getVertex(x, y) {
        let point = this.vertices.find(p => p.x == x && p.y == y);
        return point;
    }

    getTile(x, y) {
        return this.tiles[x][y];
    }
}