const crypto = require('crypto');

const SUITS = ['S', 'H', 'D', 'C'];
const RANKS = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];

const STATE = {
    CUT: 'WAITING_FOR_CUT',
    BET: 'WAITING_FOR_BET',
    DECISION: 'WAITING_FOR_DECISION',
    END: 'ROUND_END'
}

class GameError extends Error {
    constructor(code) {
        super(code);
        this.code = code;
    }
}

function makeDeck() {
    let cards = [];
    for (let s of SUITS) {
        for (let r of RANKS){
            cards.push({suit: s, rank: r});
        }
    }
    return cards
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function cutDeck(deck, amount){
    return deck.slice(n).concat(deck.slice(0, n));
}

class Game {
    constructor(balance = 1000) {
        this.id = crypto.randomUUID;
        this.balance = balance;
        this.start;
    }

    start(){
        this.deck = shuffle(makeDeck());
        this.player = [];
        this.dealer = [];
        this.betAmount = 0;
        this.result = null;
        this.state = STATE.CUT;
    }

    cut(amount){
        if (this.state !== STATE.CUT) {
            throw new GameError('ERR_INVALID_STATE');
        }
        if (!Number.isInteger(amount) || amount <= 0 || amount >= this.deck.length){
            throw new GameError('ERR_INVALID_AMOUNT')
        }
        this.deck = cutDeck(this.deck, amount);
        this.state = STATE.BET;
    }

    bet(){}

    draw(){}

    dealerTurn(){}

    finish(){}

    nextRound(){}
}