export class Canvas {
    constructor(width, height) {
        this.canvas = null;
        this.ctx = null;
        this.width = width;
        this.height = height;
        this.init();
    }

    init() {
        this.createCanvas();
        this.resize();
    }

    resize() {
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
    }

    getBoundingClientRect() {
        return this.canvas.getBoundingClientRect();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'canvas';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    drawPath2D(x, y, w, h, strokeStyle = '#000000', lineWidth = 0.2) {
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = strokeStyle;
        const path = new Path2D();
        path.rect(x, y, w, h);
        path.closePath();
        this.ctx.stroke(path);
    }

    drawLine(start, end) {
        const {ctx} = this;

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    drawPoint(point, pointRadius, fillColor) {
        const {ctx} = this;

        ctx.beginPath();
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = 'black';
        ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    clear(x = 0, y = 0, width = this.width, height = this.height) {
        this.ctx.clearRect(x, y, width, height);
    }
}