const crypto = require('crypto');

class Game {
    constructor() {
        this.id = crypto.randomUUID;
        this.deck = [];
        this.player = {};  
    }

    start(){}

    cut(){}

    bet(){}

    draw(){}

    dealerTurn(){}

    finish(){}

    nextRound(){}
}