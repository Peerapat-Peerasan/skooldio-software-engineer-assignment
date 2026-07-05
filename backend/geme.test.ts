import { describe, it, expect } from 'vitest';
import { Game, GameError, getScore } from './game';

const card = (suit: any, rank: any) => ({ suit, rank });

describe('getScore', () => {
    it('adds cards and keeps last digit', () => {
        expect(getScore([card('S', 5), card('H', 8)])).toBe(3);
    });

    it('face cards and 10 are 0', () => {
        expect(getScore([card('S', 'K'), card('H', 10)])).toBe(0);
    });

    it('Ace is 1', () => {
        expect(getScore([card('S', 'A'), card('H', 8)])).toBe(9);
    });
});

describe('game flow', () => {
    it('starts in WAITING_FOR_CUT', () => {
        let g = new Game(1000);
        expect(g.state).toBe('WAITING_FOR_CUT');
        expect(g.balance).toBe(1000);
    });

    it('cut moves to WAITING_FOR_BET', () => {
        let g = new Game();
        g.cut(10);
        expect(g.state).toBe('WAITING_FOR_BET');
    });

    it('bet deducts balance and deals cards', () => {
        let g = new Game(1000);
        g.cut(10);
        g.bet(100);
        expect(g.player.length).toBe(2);
        expect(g.dealer.length).toBe(2);
        expect(g.balance).toBeLessThanOrEqual(1000);
    });
    
    it('full round ends and pays out', () => {
        let g = new Game(1000);
        g.cut(10);
        g.bet(100);
        if (g.state === 'WAITING_FOR_DECISION') {
        g.draw('stay');
        }
        expect(g.state).toBe('ROUND_END');
        expect(g.result).not.toBeNull();
    });

    it('next round resets state', () => {
        let g = new Game();
        g.cut(10);
        g.bet(100);
        if (g.state === 'WAITING_FOR_DECISION') g.draw('stay');
        g.nextRound();
        expect(g.state).toBe('WAITING_FOR_CUT');
    });
});

describe('errors', () => {
    it('bet before cut throws INVALID_STATE', () => {
        let g = new Game();
        expect(() => g.bet(100)).toThrow('ERR_INVALID_STATE');
    });

    it('draw before bet throws INVALID_STATE', () => {
        let g = new Game();
        g.cut(10);
        expect(() => g.draw('draw')).toThrow('ERR_INVALID_STATE');
    });

    it('bet 0 throws INVALID_AMOUNT', () => {
        let g = new Game();
        g.cut(10);
        expect(() => g.bet(0)).toThrow('ERR_INVALID_AMOUNT');
    });

    it('bet more than balance throws INSUFFICIENT_FUNDS', () => {
        let g = new Game(50);
        g.cut(10);
        expect(() => g.bet(100)).toThrow('ERR_INSUFFICIENT_FUNDS');
    });

    it('bad cut amount throws INVALID_AMOUNT', () => {
        let g = new Game();
        expect(() => g.cut(0)).toThrow('ERR_INVALID_AMOUNT');
    });

    it('error carries a code', () => {
        let g = new Game();
        try {
        g.bet(100);
        } catch (e) {
        expect(e).toBeInstanceOf(GameError);
        expect((e as GameError).code).toBe('ERR_INVALID_STATE');
        }
    });
});

describe('view hides dealer', () => {
    it('dealer hidden before round ends', () => {
        let g = new Game();
        g.cut(10);
        g.bet(100);
        let v = g.view();
        if (v.state !== 'ROUND_END') {
        expect(v.dealer_hand_visible).toEqual([]);
        expect(v.dealer_score).toBeNull();
        }
    });
});