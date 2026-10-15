import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { HexBoard } from "@/components/HexBoard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { applyMove, type GameState } from "@/lib/game";
import { key, type Axial } from "@/lib/hex";
import { useI18n, type TKey } from "@/lib/i18n";
import { playMoveSound } from "@/lib/sound";
import logoE from "@/assets/tutorial/logo_e.png";
import logoM from "@/assets/tutorial/logo_m.png";
import logoT from "@/assets/tutorial/logo_t.png";
import electronStep from "@/assets/tutorial/e-e.png";
import muonTauStep from "@/assets/tutorial/m-t.png";

export const Route = createFileRoute("/game/tutorial")({
  head: () => ({
    meta: [
      { title: "Tutorial — Neutrino Arena" },
      { name: "description", content: "Impara a giocare a Neutrino Arena con il tutorial interattivo." },
      { property: "og:title", content: "Tutorial — Neutrino Arena" },
      { property: "og:description", content: "Impara a giocare a Neutrino Arena con il tutorial interattivo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorialGame,
});

// The welcome starts with an empty board.
const emptyState: GameState = {
  pieces: {},
  reserves: { yellow: [], purple: [] },
  turn: "yellow",
  first: "yellow",
  winner: null,
  moves: 0,
  history: [],
};

// Step 1 setup: three yellow pawns placed after the welcome message.
const step1State: GameState = {
  ...emptyState,
  pieces: {
    "1,3": { id: "tut-e", owner: "yellow", pos: { q: 1, r: 3 }, state: "E", kind: "pawn" }, // b4
    "2,2": { id: "tut-m", owner: "yellow", pos: { q: 2, r: 2 }, state: "M", kind: "pawn" }, // c3
    "3,1": { id: "tut-t", owner: "yellow", pos: { q: 3, r: 1 }, state: "T", kind: "pawn" }, // d2
  },
};

const messages: { title: TKey; body: TKey }[] = [
  { title: "tutorial.welcomeTitle", body: "tutorial.welcomeBody" },
  { title: "tutorial.flavoursTitle", body: "tutorial.flavoursBody" },
  { title: "tutorial.oscillationTitle", body: "tutorial.oscillationBody" },
  { title: "tutorial.piecesTitle", body: "tutorial.piecesBody" },
  { title: "tutorial.oneStepTitle", body: "tutorial.oneStepBody" },
];

const guidedMoves = [
  { from: { q: 1, r: 3 }, to: { q: 2, r: 3 } },
  { from: { q: 2, r: 2 }, to: { q: 3, r: 2 } },
  { from: { q: 3, r: 1 }, to: { q: 4, r: 1 } },
];

const illustrations: Record<string, { src: string; alt: string; wide?: boolean }> = {
  e: { src: logoE, alt: "E" },
  m: { src: logoM, alt: "M" },
  t: { src: logoT, alt: "T" },
  ee: { src: electronStep, alt: "E → E", wide: true },
  mt: { src: muonTauStep, alt: "M ↔ T", wide: true },
};

function TutorialGame() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Axial | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [practiceState, setPracticeState] = useState(step1State);
  const [moveIndex, setMoveIndex] = useState(0);
  const message = messages[messageIndex];
  const state = messageIndex === 0 ? emptyState : practiceState;
  const guidedMove = guidedMoves[moveIndex] ?? null;

  const onMove = (from: Axial, to: Axial) => {
    if (message || !guidedMove || key(from) !== key(guidedMove.from) || key(to) !== key(guidedMove.to)) return;
    const next = applyMove(practiceState, from, to);
    if (!next) return;
    setPracticeState({ ...next, turn: "yellow", first: "yellow" });
    setSelected(null);
    setMoveIndex((current) => current + 1);
    playMoveSound();
  };

  return (
    <GameShell title={t("tutorial.title")} subtitle={t("tutorial.subtitle")} state={state}>
      <AlertDialog open={Boolean(message)}>
        <AlertDialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto" onKeyDown={(event) => event.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{message ? t(message.title) : ""}</AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed">
              {message ? t(message.body).split(/(\{(?:e|m|t|ee|mt)\})/g).map((part, index) => {
                const illustration = illustrations[part.slice(1, -1)];
                return illustration ? <img key={index} src={illustration.src} alt={illustration.alt} className={illustration.wide ? "mx-1 inline-block h-12 w-36 max-w-full object-contain align-middle" : "mx-1 inline-block h-10 w-10 object-contain align-middle"} /> : part;
              }) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={(event) => { event.preventDefault(); setMessageIndex((current) => current + 1); }}>
              {t("tutorial.continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="space-y-3">
        <HexBoard
          state={state}
          selected={selected}
          onSelect={(cell) => {
            if (!cell || (guidedMove && key(cell) === key(guidedMove.from))) setSelected(cell);
          }}
          onMove={onMove}
          guidedMove={guidedMove}
          disabled={Boolean(message) || !guidedMove}
        />
      </div>
    </GameShell>
  );
}
