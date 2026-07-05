import crypto from 'crypto';

const SUITS = ['S', 'H', 'D', 'C'] as const;
const RANKS = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'] as const;

type Suit = typeof SUITS[number];
type Rank = typeof RANKS[number];

interface Card {
    suit: Suit;
    rank: Rank;
}

type Hand = Card[];

type State =
    | 'WAITING_FOR_CUT'
    | 'WAITING_FOR_BET'
    | 'WAITING_FOR_DECISION'
    | 'ROUND_END';

type Outcome = 'win' | 'tie' | 'loss'; 

interface Result {
    outcome: Outcome;
    payout: number;
    player_score: number;
    dealer_score: number;
}

interface GameView {
    game_id: string;
    state: State;
    balance: number;
    player_hand: Hand;
    dealer_hand_visible: Hand;
    player_score: number | null;
    dealer_score: number | null;
    winner: 'Player' | 'Dealer' | 'Tie' | null;
}

type ErrorCode =
    | 'ERR_SESSION_NOT_FOUND'
    | 'ERR_INVALID_STATE'
    | 'ERR_INSUFFICIENT_FUNDS'
    | 'ERR_INVALID_AMOUNT';
    
class GameError extends Error {
    code: ErrorCode;
    constructor(code: ErrorCode) {
        super(code);
        this.code = code;
    }
}

function makeDeck(): Hand {
    let cards: Hand = [];
    for (let s of SUITS) {
        for (let r of RANKS) {
        cards.push({suit: s, rank: r});
        }
    }
    return cards;
}

function shuffle(deck: Hand): Hand {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function cutDeck(deck: Hand, amount: number): Hand {
    return deck.slice(amount).concat(deck.slice(0, amount));
}

function cardValue(rank: Rank): number {
    if (rank === 'A') return 1;
    if (rank === 'J' || rank === 'Q' || rank === 'K' || rank === 10) return 0;
    return rank;
}

function getScore(hand: Hand): number {
    return hand.reduce((sum, c) => sum + cardValue(c.rank), 0) % 10;
}
 
function isPok(hand: Hand): boolean {
    return hand.length === 2 && (getScore(hand) === 8 || getScore(hand) === 9);
}

function settle(
    playerScore: number,
    dealerScore: number,
    bet: number
    ): { outcome: Outcome; payout: number } {
    if (playerScore > dealerScore) return { outcome: 'win', payout: bet * 2 };
    if (playerScore === dealerScore) return { outcome: 'tie', payout: bet };
    return { outcome: 'loss', payout: 0 };
}

class Game {
    id: string;
    balance: number;
    deck: Hand = [];
    player: Hand = [];
    dealer: Hand = [];
    betAmount = 0;
    result: Result | null = null;
    state: State = 'WAITING_FOR_CUT';

    constructor(balance = 1000) {
        this.id = crypto.randomUUID();
        this.balance = balance;
        this.start();
    }

    start(): void {
        this.deck = shuffle(makeDeck());
        this.player = [];
        this.dealer = [];
        this.betAmount = 0;
        this.result = null;
        this.state = 'WAITING_FOR_CUT';
    }

    cut(amount: number): void {
        if (this.state !== 'WAITING_FOR_CUT') {
        throw new GameError('ERR_INVALID_STATE');
        }
        if (!Number.isInteger(amount) || amount <= 0 || amount >= this.deck.length) {
        throw new GameError('ERR_INVALID_AMOUNT');
        }
        this.deck = cutDeck(this.deck, amount);
        this.state = 'WAITING_FOR_BET';
    }

    bet(amount: number): void {
        if (this.state !== 'WAITING_FOR_BET') {
        throw new GameError('ERR_INVALID_STATE');
        }
        if (!Number.isInteger(amount) || amount <= 0) {
        throw new GameError('ERR_INVALID_AMOUNT');
        }
        if (amount > this.balance) {
        throw new GameError('ERR_INSUFFICIENT_FUNDS');
        }
    
        this.betAmount = amount;
        this.balance -= amount;
    
        this.player = [this.deck.pop()!, this.deck.pop()!];
        this.dealer = [this.deck.pop()!, this.deck.pop()!];
    
        if (isPok(this.player) || isPok(this.dealer)) {
        this.finish();
        } else {
        this.state = 'WAITING_FOR_DECISION';
        }
    }

    draw(action: 'draw' | 'stay'): void {
        if (this.state !== 'WAITING_FOR_DECISION') {
        throw new GameError('ERR_INVALID_STATE');
        }
        if (action === 'draw') {
        this.player.push(this.deck.pop()!);
        } else if (action !== 'stay') {
        throw new GameError('ERR_INVALID_AMOUNT');
        }
        this.dealerTurn();
        this.finish();
    }
    
    dealerTurn(): void {
        if (getScore(this.dealer) < 4) {
        this.dealer.push(this.deck.pop()!);
        }
    }

    finish(): void {
        let ps = getScore(this.player);
        let ds = getScore(this.dealer);
    
        let { outcome, payout } = settle(ps, ds, this.betAmount);
    
        this.balance += payout;
        this.result = { outcome, payout, player_score: ps, dealer_score: ds };
        this.state = 'ROUND_END';
    }

    nextRound(): void {
        if (this.state !== 'ROUND_END') {
        throw new GameError('ERR_INVALID_STATE');
        }
        this.start();
    }

    view(): GameView {
        let ended = this.state === 'ROUND_END';
        let winner: GameView['winner'] = null;

        if (ended && this.result) {
            if (this.result.outcome === 'win') winner = 'Player';
            else if (this.result.outcome === 'loss') winner = 'Dealer';
            else winner = 'Tie';
        }
    
        return {
            game_id: this.id,
            state: this.state,
            balance: this.balance,
            player_hand: this.player,
            dealer_hand_visible: ended ? this.dealer : [],
            player_score: this.player.length ? getScore(this.player) : null,
            dealer_score: ended ? getScore(this.dealer) : null,
            winner
        };
    }
}

export { Game, GameError, getScore, isPok };