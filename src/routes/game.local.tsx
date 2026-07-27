import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { HexBoard } from "@/components/HexBoard";
import { applyMove, initialState } from "@/lib/game";
import type { Axial } from "@/lib/hex";

export const Route = createFileRoute("/game/local")({
  head: () => ({
    meta: [
      { title: "Partita locale — Rombo" },
      { name: "description", content: "Gioca a Rombo in locale, due giocatori sullo stesso dispositivo." },
      { property: "og:title", content: "Partita locale — Rombo" },
      { property: "og:description", content: "Due giocatori, un dispositivo, una plancia esagonale a rombo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LocalGame,
});

function LocalGame() {
  const [state, setState] = useState(initialState());
  const [selected, setSelected] = useState<Axial | null>(null);

  const handleMove = (from: Axial, to: Axial, chosen?: "M" | "T") => {
    const next = applyMove(state, from, to, chosen);
    if (next) {
      setState(next);
      setSelected(null);
    }
  };

  return (
    <GameShell title="Partita locale" subtitle="Due giocatori, stesso dispositivo" state={state}
      actions={
        <button
          onClick={() => { setState(initialState()); setSelected(null); }}
          className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-accent transition"
        >
          Nuova partita
        </button>
      }
    >
      <HexBoard state={state} selected={selected} onSelect={setSelected} onMove={handleMove} />
    </GameShell>
  );
}
