export function create(width, height) {
    const canvasElem = document.createElement('canvas');
    canvasElem.id = 'canvas';
    document.body.appendChild(canvasElem);

    const ctx = canvasElem.getContext('2d');

    canvasElem.width = width;
    canvasElem.height = height;

    return {canvasElem, ctx};
}

export function drawPath2D(ctx, x, y, w, h, strokeStyle = '#000000', lineWidth = 0.2) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    const path = new Path2D();
    path.rect(x, y, w, h);
    path.closePath();
    ctx.stroke(path);
    return path;
}

export function colorPath2D(ctx, path, fillStyle = 'green') {
    ctx.fillStyle = fillStyle;
    ctx.fill(path);
}

export function drawLine(ctx, start, end, lineWidth = 3, strokeStyle = 'black', lineCap = 'round') {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.lineCap = lineCap;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}

export function drawPoint(ctx, x, y, pointRadius, fillColor = 'black') {
    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = 'black';
    ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

export function drawText(ctx, x, y, text, fillColor = 'black', font = 'bold 20px san-serif') {
    ctx.fillStyle = fillColor;
    ctx.font = font;
    ctx.fillText(text, x, y);
}