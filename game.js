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

function cardValue(rank) {
    if (rank === 'A') return 1;
    if (['J', 'Q', 'K', 10].includes(rank)) return 0;
    return rank;
}

function getScore(hand) {
    return hand.reduce((sum, c) => sum + cardValue(c.rank), 0) % 10;
}
 
function isPok(hand) {
    return hand.length === 2 && (getScore(hand) === 8 || getScore(hand) === 9);
}

function settle(playerScore, dealerScore, bet) {
    if (playerScore > dealerScore) {
        return { outcome: 'win', payout: bet * 2 };
    }
    if (playerScore === dealerScore) {
        return { outcome: 'tie', payout: bet };
    }
    return { outcome: 'loss', payout: 0 };
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
            throw new GameError('ERR_INVALID_AMOUNT');
        }
        this.deck = cutDeck(this.deck, amount);
        this.state = STATE.BET;
    }

    bet(amount){
        if (this.state !== STATE.BET) {
            throw new GameError('ERR_INVALID_STATE');
        }
        if (!Number.isInteger(amount) || amount <= 0){
            throw new GameError('ERR_INVALID_AMOUNT');
        }
        if (amount < this.balance){
            throw new GameError('ERR_INSUFFICIENT_FUNDS');
        }
        this.betAmount = amount;
        this.balance -= amount;
    
        this.player = [this.deck.pop(), this.deck.pop()];
        this.dealer = [this.deck.pop(), this.deck.pop()];
    
        if (isPok(this.player) || isPok(this.dealer)) {
        this.finish();
        } 
        else {
            this.state = STATE.DECISION;
        }  
    }

    draw(action){
        if (this.state !== STATE.DECISION) {
            throw new GameError('ERR_INVALID_STATE');
        }
        if (action === 'draw') {
            this.player.push(this.deck.pop());
        } else if (action !== 'stay') {
            throw new GameError('ERR_INVALID_ACTION');
        }
        this.dealerTurn();
        this.finish();
    }

    dealerTurn(){
        if (getScore(this.dealer) < 4) {
            this.dealer.push(this.deck.pop());
        }
    }

    finish(){
        let ps = getScore(this.player);
        let ds = getScore(this.dealer);

        let {outcome, payout} = settle(ps, ds, this.betAmount);

        this.balance += payout;
        this.result = {outcome, payout, player_score: ps, dealer_score: ds};
        this.state = STATE.END;
    }

    nextRound(){}
}