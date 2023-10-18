import { setTilePaths, conqueredTiles } from "./grid.js";

export {players};

let currentPlayer = null;
let players = [];

export function handleTileConquer() {
    if(conqueredTiles.length > 0) {
        currentPlayer.points += conqueredTiles.length;
        setTilePaths(currentPlayer.claimType);
    }
    updatePlayerTurns();
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