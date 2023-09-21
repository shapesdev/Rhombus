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
        this.tileType = null;
    }
}