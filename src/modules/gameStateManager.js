import { setTilePaths, conqueredTiles, totalLegalMoves, updateLegalMoves, tiles, updateConqueredTilesCollection } from "./grid.js";

export {players, current};

let current = null;
let players = [];

export function initStartingPlayer(player) {
    current = player;
}

export function handleTileConquer() {
    current.totalLinesDrawn += 1;

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
    gameOverPointsUpdate();
    updateStatistics();
    displayWinnerStatistics();
}

function displayWinnerStatistics() {
    console.log(`${players[0].playerName} Won!`)
    //console.log(players[0]);
}

function updateStatistics() {
    players.sort((a, b) => b.points - a.points);
    const winner = players[0];
    const loser = players[1];

    winner.totalGamesPlayed += 1;
    winner.totalWins += 1;
    loser.totalGamesPlayed += 1;
    loser.totalLoses += 1;
}

function gameOverPointsUpdate() {
    const tempArray = [];
    tiles.forEach((tiles2 => {
        tiles2.forEach((tile => {
            if(tile && tile.tileType == null) {
                tempArray.push(tile);
            }
        }))
    }));
    updateConqueredTilesCollection(tempArray);
    
    let other = current == players[0] ? players[1] : players[0];
    other.updatePoints(tempArray.length);
    setTilePaths(other.claimType);
}

function updatePlayerTurns() {
    current = current == players[0] ? players[1] : players[0];
    //console.log(`It's ${currentPlayer.playerName} Turn!`);
}