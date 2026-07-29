import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { HexBoard } from "@/components/HexBoard";
import { applyDrop, applyMove, initialState, type Faction, type PieceState } from "@/lib/game";
import { ReserveTray } from "@/components/ReserveTray";
import { chooseAiMove } from "@/lib/ai";
import type { Axial } from "@/lib/hex";

export const Route = createFileRoute("/game/ai")({
  head: () => ({
    meta: [
      { title: "Contro l'IA — Rombo" },
      { name: "description", content: "Sfida l'intelligenza artificiale in una partita di Rombo sulla plancia esagonale a rombo." },
      { property: "og:title", content: "Contro l'IA — Rombo" },
      { property: "og:description", content: "Un giocatore contro l'IA su plancia esagonale." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiGame,
});

function AiGame() {
  const player: Faction = "yellow";
  const ai: Faction = "purple";
  const [state, setState] = useState(initialState());
  const [selected, setSelected] = useState<Axial | null>(null);
  const [dropState, setDropState] = useState<PieceState | null>(null);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (state.winner) return;
    if (state.turn !== ai) return;
    setThinking(true);
    const timeout = setTimeout(() => {
      const move = chooseAiMove(state, ai, 2);
      if (move) {
        const next = applyMove(state, move.from, move.to, move.chosen);
        if (next) setState(next);
      }
      setThinking(false);
    }, 450);
    return () => clearTimeout(timeout);
  }, [state, ai]);

  const handleMove = (from: Axial, to: Axial, chosen?: "M" | "T") => {
    if (state.turn !== player) return;
    const next = applyMove(state, from, to, chosen);
    if (next) {
      setState(next);
      setSelected(null);
      setDropState(null);
    }
  };

  const handleDrop = (to: Axial) => {
    if (!dropState || state.turn !== player) return;
    const next = applyDrop(state, player, dropState, to);
    if (next) {
      setState(next);
      setSelected(null);
      setDropState(null);
    }
  };

  const status = state.winner
    ? state.winner === player ? "Hai vinto!" : "Ha vinto l'IA"
    : thinking
      ? "L'IA sta pensando…"
      : `Tocca a te (giallo)`;

  return (
    <GameShell title="Contro l'IA" subtitle="Sei il giallo" state={state} perspective={player} status={status}
      actions={
        <button
          onClick={() => { setState(initialState()); setSelected(null); setDropState(null); }}
          className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-accent transition"
        >
          Nuova partita
        </button>
      }
    >
      <div className="space-y-3">
        <ReserveTray state={state} faction={ai} />
        <HexBoard state={state} selected={selected} onSelect={setSelected} onMove={handleMove}
          perspective={player} disabled={thinking || state.turn !== player}
          dropState={dropState} onDrop={handleDrop} />
        <ReserveTray state={state} faction={player} selected={dropState}
          onSelect={(s) => { setDropState(s); setSelected(null); }} interactive={!thinking} />
      </div>
    </GameShell>
  );
}
