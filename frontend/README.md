# Pok Deng — Frontend

A simple React client for the Pok Deng game. It talks to the backend API.

Note: this frontend was vibe coded — built fast and loose, focused on
making it work.

## What it does

- Start a game with your chips.
- Cut, bet, draw, or stay using buttons.
- Shows your hand, the dealer's hand, balance, and status.
- Dealer cards stay hidden until the round ends.
- Buttons turn on and off based on the game state.
- Shows an error if the API sends one (like betting too much).
- Shows the winner and a "Play Next Round" button at the end.

The client is "dumb". It holds no game rules. It only shows what the API
sends and passes user actions back.

## Run it

```
npm install
npm run dev
```

Then open the link it shows (like http://localhost:5173).

Make sure the backend is running on http://localhost:3000 at the same time.

## Setup

- Built with React + Vite.
- All UI and styles live in `src/App.jsx`.
- Change the `API` value at the top of `App.jsx` if your backend runs elsewhere.