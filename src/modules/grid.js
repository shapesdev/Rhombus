export class Tile {
    constructor(x, y, path = null) {
        this.x = x;
        this.y = y;
    }
}

export class Grid {
    constructor(size, tileSize) {
        this.size = size;
        this.tileSize = tileSize;
        this.vertices = [];
        this.tiles = [];
        this.init();
    }

    init() {
        this.generateGrid();
    }

    generateGrid() {
        for (let i = 0; i <= this.size; i++) {
            this.tiles[i] = [];
            for (let j = 0; j <= this.size; j++) {
                if(i < this.size && j < this.size) {
                    this.tiles[i][j] = new Tile(i, j);
                }
                this.vertices.push({x: i * this.tileSize, y: j * this.tileSize, isAvailable: true});
            }
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