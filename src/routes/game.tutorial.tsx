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
import type { GameState } from "@/lib/game";
import type { Axial } from "@/lib/hex";
import { useI18n } from "@/lib/i18n";

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

// Empty board for now: the interactive steps will be added later.
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

function TutorialGame() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Axial | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(true);

  const state = welcomeOpen ? emptyState : step1State;

  return (
    <GameShell title={t("tutorial.title")} subtitle={t("tutorial.subtitle")} state={state}>
      <AlertDialog open={welcomeOpen} onOpenChange={setWelcomeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("tutorial.welcomeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("tutorial.welcomeBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setWelcomeOpen(false)}>
              {t("tutorial.continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="space-y-3">
        <HexBoard
          state={state}
          selected={selected}
          onSelect={setSelected}
          onMove={() => {}}
        />
        <p className="text-center text-sm text-muted-foreground">{t("tutorial.placeholder")}</p>
      </div>
    </GameShell>
  );
}
