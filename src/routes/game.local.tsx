import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { HexBoard } from "@/components/HexBoard";
import { applyDrop, applyMove, initialState, type PieceState } from "@/lib/game";
import { ReserveTray } from "@/components/ReserveTray";
import type { Axial } from "@/lib/hex";

export const Route = createFileRoute("/game/local")({
  head: () => ({
    meta: [
      { title: "Partita locale — Neutrino Arena" },
      { name: "description", content: "Gioca a Neutrino Arena in locale, due giocatori sullo stesso dispositivo." },
      { property: "og:title", content: "Partita locale — Neutrino Arena" },
      { property: "og:description", content: "Gioca a Neutrino Arena in locale, due giocatori sullo stesso dispositivo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LocalGame,
});

function LocalGame() {
  const [state, setState] = useState(initialState());
  const [selected, setSelected] = useState<Axial | null>(null);
  const [dropState, setDropState] = useState<PieceState | null>(null);

  const handleMove = (from: Axial, to: Axial, chosen?: "M" | "T") => {
    const next = applyMove(state, from, to, chosen);
    if (next) {
      setState(next);
      setSelected(null);
      setDropState(null);
    }
  };

  const handleDrop = (to: Axial) => {
    if (!dropState) return;
    const next = applyDrop(state, state.turn, dropState, to);
    if (next) {
      setState(next);
      setSelected(null);
      setDropState(null);
    }
  };

  return (
    <GameShell title="Partita locale" subtitle="Due giocatori, stesso dispositivo" state={state}
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
        <ReserveTray state={state} faction="purple" selected={dropState} onSelect={(s) => { setDropState(s); setSelected(null); }} interactive />
        <HexBoard state={state} selected={selected} onSelect={setSelected} onMove={handleMove}
          dropState={dropState} onDrop={handleDrop} />
        <ReserveTray state={state} faction="yellow" selected={dropState} onSelect={(s) => { setDropState(s); setSelected(null); }} interactive />
      </div>
    </GameShell>
  );
}
