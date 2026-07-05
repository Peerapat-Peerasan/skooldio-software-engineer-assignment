import { useState } from "react";

const API = "http://localhost:3000";

const RED = ["Hearts", "Diamonds"];

// one card box
function Card({ card, hidden }) {
  if (hidden) {
    return <div style={{ ...cardStyle, background: "#b03636" }} />;
  }
  const red = RED.includes(card.suit);
  return (
    <div style={{ ...cardStyle, color: red ? "#c0392b" : "#111" }}>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{card.rank}</div>
      <div style={{ fontSize: 12, textAlign: "right" }}>{card.suit[0]}</div>
    </div>
  );
}

const cardStyle = {
  width: 56,
  height: 80,
  background: "#fff",
  borderRadius: 6,
  padding: 6,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
};

export default function App() {
  const [game, setGame] = useState(null);
  const [chips, setChips] = useState(1000);
  const [cut, setCut] = useState(10);
  const [bet, setBet] = useState(100);
  const [error, setError] = useState("");

  const state = game?.state;

  async function send(url, body) {
    setError("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error");
        return;
      }
      setGame(data);
    } catch {
      setError("Cannot reach server");
    }
  }

  const start = () => send(`${API}/game/start`, { initial_balance: Number(chips) });
  const action = (act, amount) =>
    send(`${API}/game/${game.game_id}/action`, { action: act, amount });

  // is the dealer face down?
  const dealerHidden =
    game &&
    game.dealer_hand_visible.length === 0 &&
    state !== "WAITING_FOR_CUT" &&
    state !== "WAITING_FOR_BET";

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Pok Deng</h1>

      {!game && (
        <div>
          <p>Starting chips:</p>
          <input type="number" value={chips} onChange={(e) => setChips(e.target.value)} />
          <button onClick={start}>Start Game</button>
        </div>
      )}

      {game && (
        <div>
          <p>Balance: {game.balance}</p>
          <p>Status: {game.state}</p>

          {/* dealer */}
          <p style={{ marginBottom: 4 }}>
            Dealer {game.dealer_score !== null && `(${game.dealer_score})`}
          </p>
          <div style={handStyle}>
            {dealerHidden && (
              <>
                <Card hidden />
                <Card hidden />
              </>
            )}
            {game.dealer_hand_visible.map((c, i) => (
              <Card key={i} card={c} />
            ))}
          </div>

          {/* player */}
          <p style={{ marginBottom: 4 }}>
            You {game.player_score !== null && `(${game.player_score})`}
          </p>
          <div style={handStyle}>
            {game.player_hand.map((c, i) => (
              <Card key={i} card={c} />
            ))}
          </div>

          {game.winner && <h2>{game.winner === "Tie" ? "Tie!" : game.winner + " wins!"}</h2>}

          {/* tell the player what to do now */}
          <p style={{ fontWeight: 600 }}>
            {state === "WAITING_FOR_CUT" && "Please cut the deck."}
            {state === "WAITING_FOR_BET" && "Please place your bet."}
            {state === "WAITING_FOR_DECISION" && "Draw a card or stay?"}
            {state === "ROUND_END" && "Round over. Play again?"}
          </p>

          {state === "WAITING_FOR_CUT" && (
            <div>
              <input type="number" value={cut} onChange={(e) => setCut(e.target.value)} />
              <button onClick={() => action("cut", Number(cut))}>Cut</button>
            </div>
          )}

          {state === "WAITING_FOR_BET" && (
            <div>
              <input type="number" value={bet} onChange={(e) => setBet(e.target.value)} />
              <button onClick={() => action("bet", Number(bet))}>Bet</button>
            </div>
          )}

          {state === "WAITING_FOR_DECISION" && (
            <div>
              <button onClick={() => action("draw")}>Draw</button>
              <button onClick={() => action("stay")}>Stay</button>
            </div>
          )}

          {state === "ROUND_END" && (
            <button onClick={() => action("next_round")}>Play Next Round</button>
          )}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

const handStyle = { display: "flex", gap: 8, minHeight: 84, marginBottom: 12 };