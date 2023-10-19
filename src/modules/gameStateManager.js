import { setTilePaths, conqueredTiles, totalLegalMoves, updateLegalMoves, tiles, updateConqueredTilesCollection } from "./grid.js";

export {players};

let currentPlayer = null;
let players = [];

export function handleTileConquer() {
    if(conqueredTiles.length > 0) {
        currentPlayer.updatePoints(conqueredTiles.length);
        setTilePaths(currentPlayer.claimType);
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
    let tempArray = [];
    tiles.forEach((tiles2 => {
        tiles2.forEach((tile => {
            if(tile.tileType == null) {
                tempArray.push(tile);
            }
        }))
    }))
    let player = currentPlayer == players[0] ? players[1] : players[0];
    player.updatePoints(tempArray.length);

    updateConqueredTilesCollection(tempArray);
    setTilePaths(player.claimType);

    const winner = player.points > currentPlayer.points ? player : currentPlayer;
    console.log(`${winner.playerName} Won!`);
}

function updatePlayerTurns() {
    if(currentPlayer == null) {
        currentPlayer = players[0];
    }
    else {
        currentPlayer = currentPlayer == players[0] ? players[1] : players[0];
    }
    //console.log(`It's ${currentPlayer.playerName} Turn!`);
}