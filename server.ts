import express, { Request, Response } from 'express';
import { Game, GameError } from './game';

const app = express();
app.use(express.json());
 
const games: Record<string, Game> = {};

app.post('/game/start', (req: Request, res: Response) => {});

app.post('/game/:game_id/action', (req: Request, res: Response) => {});

app.listen(3000, () => console.log('Running on http://localhost:3000'));