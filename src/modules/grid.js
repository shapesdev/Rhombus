export class Grid {
    constructor(size, tileSize) {
        this.size = size;
        this.tileSize = tileSize;
        this.points = [];
        this.init();
    }

    init() {
        this.generateGrid();
    }

    generateGrid() {
        for (let i = 0; i <= this.size; i++) {
            for (let j = 0; j <= this.size; j++) {
                this.points.push({x: i * this.tileSize, y: j * this.tileSize, isAvailable: true});
            }
        }
    }

    getPoint(x, y) {
        let point = this.points.find(p => p.x == x && p.y == y);
        return point;
    }
}