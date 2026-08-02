import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { HexBoard } from "@/components/HexBoard";
import { applyDrop, applyMove, initialState, type PieceState } from "@/lib/game";
import { ReserveTray } from "@/components/ReserveTray";
import { key, type Axial } from "@/lib/hex";
import { playMoveSound } from "@/lib/sound";
import PdfViewerModal from "@/components/PdfViewerModal";

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
  // Deterministic on the server to avoid hydration mismatches; the real
  // random first player is drawn on the client after mount.
  const [state, setState] = useState(() => initialState("yellow"));
  const [past, setPast] = useState<ReturnType<typeof initialState>[]>([]);
  const [selected, setSelected] = useState<Axial | null>(null);
  const [dropState, setDropState] = useState<PieceState | null>(null);

  useEffect(() => {
    setState(initialState());
  }, []);

  const handleMove = (from: Axial, to: Axial, chosen?: "M" | "T") => {
    const next = applyMove(state, from, to, chosen);
    if (next) {
      setPast((p) => [...p, state]);
      setState(next);
      setSelected(null);
      setDropState(null);
    }
  };

  const handleDrop = (to: Axial) => {
    if (!dropState) return;
    const next = applyDrop(state, state.turn, dropState, to);
    if (next) {
      setPast((p) => [...p, state]);
      setState(next);
      setSelected(null);
      setDropState(null);
    }
  };

  const undo = () => {
    setPast((p) => {
      if (p.length === 0) return p;
      setState(p[p.length - 1]);
      setSelected(null);
      setDropState(null);
      return p.slice(0, -1);
    });
  };

  return (
    <GameShell title="Partita locale" subtitle="Due giocatori, stesso dispositivo" state={state}
      actions={
	<div className="flex items-center gap-3">
	<PdfViewerModal />
        <button
          onClick={undo}
          disabled={past.length === 0}
          className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-accent transition disabled:opacity-40 disabled:pointer-events-none"
        >
          Annulla
        </button>
        <button
          onClick={() => { setState(initialState()); setPast([]); setSelected(null); setDropState(null); }}
          className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-accent transition"
        >
          Nuova partita
        </button>
	</div>
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
