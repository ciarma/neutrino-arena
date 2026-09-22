import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { HexBoard } from "@/components/HexBoard";
import { applyDrop, applyMove, initialState, type Faction, type PieceState } from "@/lib/game";
import { ReserveTray } from "@/components/ReserveTray";
import { applyAiMove, chooseAiMove, type Difficulty } from "@/lib/ai";
import { key, type Axial } from "@/lib/hex";
import { playMoveSound, playVictorySound, playDefeatSound } from "@/lib/sound";
import PdfViewerModal from "@/components/PdfViewerModal";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
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
    const delay = 450 + Math.random() * 600; // 300–600 ms
    const timeout = setTimeout(() => {
      const move = chooseAiMove(state, ai, 2, difficulty);
      if (move) {
        const next = applyAiMove(state, ai, move);
        if (next) { playMoveSound("move"); setState(next); }
      }
      setThinking(false);
    }, delay);
    return () => clearTimeout(timeout);
  }, [state, ai, difficulty]);

  useEffect(() => {
    if (!state.winner) return;
    if (state.winner === player) playVictorySound();
    else playDefeatSound();
  }, [state.winner, player]);


  if (!difficulty) {
    return <DifficultyPicker onPick={(d) => { setDifficulty(d); setState(initialState()); }} />;
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
    ? state.winner === player ? t("ai.won") : t("ai.lost")
    : thinking
      ? t("ai.thinking")
      : t("ai.yourTurn");

  return (
    <GameShell title={t("ai.title")} subtitle={t("ai.subtitle", { difficulty: difficulty === "easy" ? t("ai.easy") : t("ai.hard") })} state={state} perspective={player} status={status}
      actions={
	<div className="flex items-center gap-3">
	<PdfViewerModal />
        <button
          onClick={() => { setDifficulty(null); setState(initialState("yellow")); setSelected(null); setDropState(null); }}
          className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-accent transition"
        >
          {t("ai.changeDifficulty")}
        </button>
        <button
          onClick={() => { setState(initialState()); setSelected(null); setDropState(null); }}
          className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-accent transition"
        >
          {t("common.newGame")}
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
