import { setTilePaths, conqueredTiles } from "../modules/grid.js";

export class GameStateManager {
    constructor(players) {   
      this.currentPlayer = null;
      this.players = players;
      this.updatePlayerTurns();
    }
  
    handleTileConquer() {
        if(conqueredTiles.length > 0) {
            this.currentPlayer.points += conqueredTiles.length;
            setTilePaths(this.currentPlayer.claimType);
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