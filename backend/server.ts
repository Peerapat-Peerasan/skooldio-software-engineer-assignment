import express, { Request, Response } from 'express';
import { Game, GameError } from './game';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
 
const games: Record<string, Game> = {};

const STATUS: Record<string, number> = {
    ERR_SESSION_NOT_FOUND: 404,
    ERR_INVALID_STATE: 409,
    ERR_INSUFFICIENT_FUNDS: 400,
    ERR_INVALID_AMOUNT: 400
};

app.post('/game/start', (req: Request, res: Response) => {
    let balance: number = req.body.initial_balance ?? 1000;
    let game = new Game(balance);
    games[game.id] = game;
    res.json(game.view());
});

app.post('/game/:game_id/action', (req: Request, res: Response) => {
    let gameId = req.params.game_id as string;
    let game = games[gameId];
    if (!game) {
        return res.status(404).json({ error: 'ERR_SESSION_NOT_FOUND' });
    }
    
    let {action, amount} = req.body as {action: string; amount?: number};
    
    try {
        switch (action) {
        case 'cut':
            game.cut(amount as number);
            break;
        case 'bet':
            game.bet(amount as number);
            break;
        case 'draw':
            game.draw('draw');
            break;
        case 'stay':
            game.draw('stay');
            break;
        case 'next_round':
            game.nextRound();
            break;
        default:
            return res.status(400).json({error: 'ERR_INVALID_AMOUNT'});
        }
    } catch (e) {
        if (e instanceof GameError) {
        return res.status(STATUS[e.code] ?? 400).json({error: e.code});
        }
        throw e;
    }
    
    res.json(game.view());
});

app.listen(3000, () => console.log('Running on http://localhost:3000'));