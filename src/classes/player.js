export class Player {
    constructor(playerName, lineColor = 'black', claimType = 'rgba(128, 231, 143, 0.9)') {
        this.playerName = playerName;
        this.lineColor = lineColor;
        this.claimType = claimType;
        this.points = 0;

        this.pointsElem = null;

        //Statistics overall
        this.totalGamesPlayed = 0;
        this.totalWins = 0;
        this.totalLoses = 0;
        this.totalLinesDrawn = 0;
        this.totalPointsReceived = 0;
        this.highestPointsReceived = 0;
    }

    updatePoints(points) {
        this.points += points;
        this.totalPointsReceived += points;
        if(this.highestPointsReceived < points) {
            this.highestPointsReceived = points;
        }
        this.pointsElem.innerText = this.points;
    }
}