import { setTilePaths, conqueredTiles, totalLegalMoves, updateLegalMoves, tiles, updateConqueredTilesCollection } from "./grid.js";

export {players};

let current = null;
let players = [];

export function handleTileConquer() {
    if(conqueredTiles.length > 0) {
        current.updatePoints(conqueredTiles.length);
        setTilePaths(current.claimType);
    }
    updateLegalMoves();

    if(totalLegalMoves == 0) {
        gameOver();
    }
    else {
        updatePlayerTurns();
    }
}

function gameOver() {
    const tempArray = [];
    tiles.forEach((tiles2 => {
        tiles2.forEach((tile => {
            if(tile.tileType == null) {
                tempArray.push(tile);
            }
        }))
    }))
    let other = current == players[0] ? players[1] : players[0];
    other.updatePoints(tempArray.length);

    updateConqueredTilesCollection(tempArray);
    setTilePaths(other.claimType);

    const winner = other.points > current.points ? other : current;
    console.log(`${winner.playerName} Won!`);
}

function updatePlayerTurns() {
    if(current == null) {
        current = players[0];
    }
    else {
        current = current == players[0] ? players[1] : players[0];
    }
    //console.log(`It's ${currentPlayer.playerName} Turn!`);
}