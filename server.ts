import express, { Request, Response } from 'express';
import { Game, GameError } from './game';

const app = express();
app.use(express.json());
 
const games: Record<string, Game> = {};

app.post('/game/start', (req: Request, res: Response) => {
    let balance: number = req.body.initial_balance ?? 1000;
    let game = new Game(balance);
    games[game.id] = game;
    res.json(game.view());
});

app.post('/game/:game_id/action', (req: Request, res: Response) => {});

app.listen(3000, () => console.log('Running on http://localhost:3000'));