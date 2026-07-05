const crypto = require('crypto');

const SUITS = ['S', 'H', 'D', 'C'];
const RANKS = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];

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