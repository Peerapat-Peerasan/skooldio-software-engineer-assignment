# skooldio-software-engineer-assignment

## About

This is the assignment project for the software-engineer application at Skooldio
by Peerapat Peerasan.

## AI assisted parts

Some scripts are assisted by AI.

These parts were built with AI help:

- Frontend
- Tests
- JavaScript to TypeScript conversion
- Some card processing logic idea
- This Documentation

# Pok Deng — Backend

A game server for Pok Deng, built with Node, Express, and TypeScript.
The player plays against the dealer, with betting and chips.

## What it does

- Holds all game rules and cards. The frontend stays dumb.
- One game session per player, tracked by a game id.
- Follows a strict state flow. Actions out of order return an error.

## Game flow

```
WAITING_FOR_CUT -> WAITING_FOR_BET -> WAITING_FOR_DECISION -> ROUND_END -> (loop)
```

1. Cut the deck.
2. Bet. Two cards go to player and dealer. A Pok (8 or 9) ends the round now.
3. Player draws a card or stays.
4. Dealer draws if score is under 4 (automatic).
5. Higher score wins. Payout is set, then next round can start.

## Scoring

- Ace = 1
- 2 to 9 = face value
- 10, J, Q, K = 0
- Score = sum of values, last digit only (13 -> 3)

## Payouts

- Win: bet x 2 back
- Tie: bet back
- Loss: nothing

## API

Two endpoints only.

### POST /game/start

Make a new game.

Body:
```json
{ "initial_balance": 1000 }
```

### POST /game/:game_id/action

All moves go here. The body says the action.

Body:
```json
{ "action": "bet", "amount": 100 }
```

Actions: `cut`, `bet`, `draw`, `stay`, `next_round`.
`amount` is only needed for `cut` and `bet`.

Every response returns the full game state. Dealer cards and score
stay hidden until the round ends.

## Errors

Returns a 4xx code with a message.

- `ERR_SESSION_NOT_FOUND` — bad game id
- `ERR_INVALID_STATE` — action at the wrong time
- `ERR_INSUFFICIENT_FUNDS` — bet more than balance
- `ERR_INVALID_AMOUNT` — bet 0 or less, or bad cut

## Run it

```
cd backend
npm install
npx tsx server.ts
```

Server runs on http://localhost:3000

## Test

```
npm test
```

## Files

- `game.ts` — game logic and the Game class
- `server.ts` — the two routes
- `game.test.ts` — tests

---

## Run the frontend

The frontend is a simple React client (in the `frontend` folder).

```
cd frontend
npm install
npm run dev
```

Then open the link it shows (like http://localhost:5173).

Run the backend at the same time, on http://localhost:3000.
