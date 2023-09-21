let lines = [];

export { lines };

export function updateLines(line) {
    const horizontalLines = [];
    const verticalLines = [];
    lines.push(line);

    lines.forEach((line) => {
        if (line.start.x === line.end.x) {
            verticalLines.push(line);
        } else {
            horizontalLines.push(line);
        }
    });
    lines = [];

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
    lines = [...verticalLines, ...horizontalLines];
}

export function isIntersecting(x1, x2, y1, y2) {
    let intersecting = false;
    let x3, x4, y3, y4;
    if(lines.length > 0) {
        lines.forEach((l) => {
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