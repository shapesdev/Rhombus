export class GameStateManager {
    constructor(players, grid) {   
      this.currentPlayer = null;
      this.players = players;
      this.grid = grid;
      this.updatePlayerTurns();
    }
  
    handleTileConquer() {
        if(this.grid.conqueredTiles.length > 0) {
            this.currentPlayer.points += this.grid.conqueredTiles.length;
            this.grid.setTilePaths(this.currentPlayer.claimType);
        }
        this.updatePlayerTurns();
    }

    updatePlayerTurns() {
        if(this.currentPlayer == null) {
            this.currentPlayer = this.players[0];
        }
        else {
            this.currentPlayer = this.currentPlayer == this.players[0] ? this.players[1] : this.players[0];
        }
        //console.log(`It's ${this.currentPlayer.playerName} Turn!`);
    }
  }