import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { HexBoard } from "@/components/HexBoard";
import { applyDrop, applyMove, initialState, type Faction, type PieceState } from "@/lib/game";
import { ReserveTray } from "@/components/ReserveTray";
import { applyAiMove, chooseAiMove, type Difficulty } from "@/lib/ai";
import { key, type Axial } from "@/lib/hex";
import { playMoveSound } from "@/lib/sound";
import PdfViewerModal from "@/components/PdfViewerModal";

export const Route = createFileRoute("/game/ai")({
  head: () => ({
    meta: [
      { title: "Contro l'IA — Neutrino Arena" },
      { name: "description", content: "Sfida l'intelligenza artificiale in una partita di Neutrino Arena." },
      { property: "og:title", content: "Contro l'IA — Neutrino Arena" },
      { property: "og:description", content: "Gioca a Neutrino Arena contro l'IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiGame,
});

function AiGame() {
  const player: Faction = "yellow";
  const ai: Faction = "purple";
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [state, setState] = useState(() => initialState("yellow"));
  const [selected, setSelected] = useState<Axial | null>(null);
  const [dropState, setDropState] = useState<PieceState | null>(null);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (!difficulty) return;
    if (state.winner) return;
    if (state.turn !== ai) return;
    setThinking(true);
    const timeout = setTimeout(() => {
      const move = chooseAiMove(state, ai, 2, difficulty);
      if (move) {
        const next = applyAiMove(state, ai, move);
        if (next) setState(next);
      }
      setThinking(false);
    }, 450);
    return () => clearTimeout(timeout);
  }, [state, ai, difficulty]);

  if (!difficulty) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-24 text-center">
          <h1 className="font-serif text-2xl">Contro l'IA</h1>
          <p className="text-sm text-muted-foreground">Scegli la difficoltà prima di iniziare.</p>
          <div className="flex w-full flex-col gap-3">
            <button
              onClick={() => { setDifficulty("easy"); setState(initialState()); }}
              className="rounded-2xl border border-border bg-card px-5 py-4 text-left transition hover:bg-accent"
            >
              <span className="block font-medium">Facile</span>
              <span className="block text-xs text-muted-foreground">L'IA commette spesso mosse non ottimali.</span>
            </button>
            <button
              onClick={() => { setDifficulty("hard"); setState(initialState()); }}
              className="rounded-2xl border border-border bg-card px-5 py-4 text-left transition hover:bg-accent"
            >
              <span className="block font-medium">Difficile</span>
              <span className="block text-xs text-muted-foreground">L'IA cerca sempre la mossa migliore.</span>
            </button>
          </div>
        </div>
      </div>
    );
  }


  const handleMove = (from: Axial, to: Axial, chosen?: "M" | "T") => {
    if (state.turn !== player) return;
    const next = applyMove(state, from, to, chosen);
    if (next) {
      playMoveSound(state.pieces[key(to)] ? "capture" : "move");
      setState(next);
      setSelected(null);
      setDropState(null);
    }
  };

  const handleDrop = (to: Axial) => {
    if (!dropState || state.turn !== player) return;
    const next = applyDrop(state, player, dropState, to);
    if (next) {
      playMoveSound("move");
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
    <GameShell title="Contro l'IA" subtitle={`Sei il giallo · difficoltà ${difficulty === "easy" ? "facile" : "difficile"}`} state={state} perspective={player} status={status}
      actions={
	<div className="flex items-center gap-3">
	<PdfViewerModal />
        <button
          onClick={() => { setDifficulty(null); setState(initialState("yellow")); setSelected(null); setDropState(null); }}
          className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-accent transition"
        >
          Cambia difficoltà
        </button>
        <button
          onClick={() => { setState(initialState()); setSelected(null); setDropState(null); }}
          className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-accent transition"
        >
          Nuova partita
        </button>
	</div>
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
