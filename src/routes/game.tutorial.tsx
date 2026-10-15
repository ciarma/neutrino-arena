import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { HexBoard } from "@/components/HexBoard";
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

function TutorialGame() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Axial | null>(null);

  return (
    <GameShell title={t("tutorial.title")} subtitle={t("tutorial.subtitle")} state={emptyState}>
      <div className="space-y-3">
        <HexBoard
          state={emptyState}
          selected={selected}
          onSelect={setSelected}
          onMove={() => {}}
        />
        <p className="text-center text-sm text-muted-foreground">{t("tutorial.placeholder")}</p>
      </div>
    </GameShell>
  );
}
