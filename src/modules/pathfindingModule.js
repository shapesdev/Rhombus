// A Start Algorithm for checking if path is possible between tiles
export function isPathPossible(startNode, endNode) {
    const closedList = [];
    const openList = [];
    let pathPossible = false;

    openList.push(startNode);

    while(openList.length > 0 ) {
        let node = openList[0];
        for(let i = 0; i < openList.length; i++) {
            if(openList[i].f < node.f || (openList[i] == node.f && openList[i].h < node.h)) {
                node = openList[i];
            }
        }
        openList.splice(openList.indexOf(node), 1);
        closedList.push(node);

        if(node == endNode) {
            pathPossible = true;
            break;
        }

        if(node.neighbors.length > 0) {
            node.neighbors.forEach((neighbor) => {
                if(!closedList.includes(neighbor) && !openList.includes(neighbor)) {
                    neighbor.g = Math.abs(startNode.x - neighbor.x) + Math.abs(startNode.y - neighbor.y);
                    neighbor.h = Math.abs(endNode.x - neighbor.x) + Math.abs(endNode.y - neighbor.y);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.nextOnPath = node;
                    if(!openList.includes(neighbor)) {
                        openList.push(neighbor);
                    }
                }
            });
        }
    }
    return pathPossible;
}