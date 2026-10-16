import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { HexBoard } from "@/components/HexBoard";
import { ReserveTray } from "@/components/ReserveTray";
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

const freeState: GameState = {
  ...emptyState,
  pieces: {
    "2,2": { id: "tut-e", owner: "yellow", pos: { q: 2, r: 2 }, state: "E", kind: "pawn" }, 
  },
};

const schierState: GameState = {
  ...emptyState,
  pieces: {
    "0,1": { id: "tut-e", owner: "yellow", pos: { q: 0, r: 1 }, state: "E", kind: "pawn" }, 
  },
};

const catturaState: GameState = {
  ...emptyState,
  pieces: {
    "1,3": { id: "tut-e", owner: "yellow", pos: { q: 1, r: 3 }, state: "E", kind: "pawn" }, 
    "3,1": { id: "tut-e", owner: "purple", pos: { q: 3, r: 1 }, state: "M", kind: "pawn" }, 
  },
};

// The tutorial is a single timeline. Add dialogs, moves, and optional board resets here.
// A "setup" replaces the board; omitting it preserves the current positions.
type TutorialStep =
  | { type: "dialog"; title: TKey; body: TKey }
  | { type: "setup"; state: GameState }
  | { type: "move"; from: Axial; to: Axial }
  | { type: "freeMove" };

const tutorialSteps: TutorialStep[] = [
  // Welcome: the board is still empty.
  { type: "dialog", title: "tutorial.welcomeTitle", body: "tutorial.welcomeBody" },

  // Preserve the original behavior: the three pawns appear after Welcome.
  { type: "setup", state: step1State },
  { type: "dialog", title: "tutorial.flavoursTitle", body: "tutorial.flavoursBody" },
  { type: "dialog", title: "tutorial.oscillationTitle", body: "tutorial.oscillationBody" },
  { type: "dialog", title: "tutorial.piecesTitle", body: "tutorial.piecesBody" },
  { type: "dialog", title: "tutorial.oneStepTitle", body: "tutorial.oneStepBody" },

  // First exercise: three guided moves, with no dialogs between them.
  { type: "move", from: { q: 1, r: 3 }, to: { q: 2, r: 3 } },
  { type: "move", from: { q: 2, r: 2 }, to: { q: 3, r: 2 } },
  { type: "move", from: { q: 3, r: 1 }, to: { q: 4, r: 1 } },

  { type: "dialog", title: "tutorial.twoStepTitle", body: "tutorial.twoStepBody" },
  { type: "move", from: { q: 2, r: 3 }, to: { q: 0, r: 3 } },
  { type: "move", from: { q: 3, r: 2 }, to: { q: 1, r: 2 } },
  { type: "move", from: { q: 4, r: 1 }, to: { q: 2, r: 1 } },

  { type: "dialog", title: "tutorial.freeStepTitle", body: "tutorial.freeStepBody" },

  { type: "dialog", title: "tutorial.schier1Title", body: "tutorial.schier1Body" },
  { type: "dialog", title: "tutorial.schier2Title", body: "tutorial.schier2Body" },
  { type: "setup", state: schierState },
  { type: "freeMove"},

  { type: "dialog", title: "tutorial.schier3Title", body: "tutorial.schier3Body" },
  { type: "setup", state: freeState },
  { type: "freeMove"},

  { type: "dialog", title: "tutorial.catturaTitle", body: "tutorial.catturaBody" },
  { type: "setup", state: catturaState },
  { type: "move", from: { q: 1, r: 3 }, to: { q: 3, r: 1 } },

  // Extend the tutorial here, for example:
  // { type: "dialog", title: "tutorial.nextTitle", body: "tutorial.nextBody" },
  // { type: "move", from: { q: 2, r: 3 }, to: { q: 3, r: 3 } }, // keep current board
  // { type: "setup", state: anotherState },                 // or replace the board
  // { type: "move", from: { q: 0, r: 0 }, to: { q: 1, r: 0 } },
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
  const [stepIndex, setStepIndex] = useState(0);
  const [practiceState, setPracticeState] = useState<GameState>(emptyState);
  const currentStep = tutorialSteps[stepIndex];
  const message = currentStep?.type === "dialog" ? currentStep : null;
  const guidedMove = currentStep?.type === "move"  ? { from: currentStep.from, to: currentStep.to }  : null;
  const state = practiceState;

  // Advance through the timeline. Setup steps run immediately and do not
  // require a click; dialogs and moves pause until the user completes them.
  const advanceTo = (nextIndex: number) => {
    let index = nextIndex;
    while (tutorialSteps[index]?.type === "setup") {
      const setup = tutorialSteps[index];
      if (setup.type === "setup") setPracticeState(setup.state);
      setSelected(null);
      index += 1;
    }
    setStepIndex(index);
  };

  const onMove = (from: Axial,to: Axial,chosen?: "M" | "T") => {
    if (
      currentStep?.type !== "move" &&
      currentStep?.type !== "freeMove"
    ) return;

    // Controlla le coordinate solo per le mosse guidate
    if (
      currentStep.type === "move" &&
      (
        key(from) !== key(currentStep.from) ||
        key(to) !== key(currentStep.to)
      )
    ) return;

    const next = applyMove(practiceState, from, to, chosen);
    if (!next) return;

    setPracticeState({
      ...next,
      turn: "yellow",
      first: "yellow",
    });

    setSelected(null);
    advanceTo(stepIndex + 1);
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
            <AlertDialogAction onClick={(event) => { event.preventDefault(); advanceTo(stepIndex + 1); }}>
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
            if (currentStep?.type === "freeMove") {
              setSelected(cell);
            } else if (
              !cell ||
              (
                guidedMove &&
                key(cell) === key(guidedMove.from)
              )
            ) {
              setSelected(cell);
            }
          }}
          onMove={onMove}
          {...(currentStep?.type === "freeMove"
            ? {}
            : { guidedMove: guidedMove ?? null })}
          disabled={
            currentStep?.type !== "move" &&
            currentStep?.type !== "freeMove"
          }
        />
      </div>
    </GameShell>
  );
}
