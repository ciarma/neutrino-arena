import { reservesOf, type Faction, type GameState, type PieceState } from "@/lib/game";
import { pieceImage } from "@/lib/piece-images";

type Props = {
  state: GameState;
  faction: Faction;
  label?: string;
  selected?: PieceState | null;
  onSelect?: (s: PieceState | null) => void;
  interactive?: boolean;
};

export function ReserveTray({ state, faction, label, selected = null, onSelect, interactive }: Props) {
  const reserve = reservesOf(state, faction);
  const name = faction === "yellow" ? "Neutrini" : "Anti-Neutrini";
  const canAct = !!interactive && !state.winner && state.turn === faction;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-background/40 px-3 py-2">
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {label ?? `Riserva ${name}`}
      </span>
      {reserve.length === 0 ? (
        <span className="text-xs text-muted-foreground">vuota</span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {reserve.map((s, i) => {
            const isSelected = canAct && selected === s;
            return (
              <button
                key={`${s}-${i}`}
                type="button"
                disabled={!canAct}
                onClick={() => onSelect?.(isSelected ? null : s)}
                title={canAct ? "Schiera questa pedina in una cella libera del tuo schieramento" : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition ${
                  isSelected ? "ring-2 ring-offset-1 ring-offset-background ring-primary" : ""
                } ${canAct ? "cursor-pointer hover:opacity-90" : "cursor-default opacity-80"}`}
                style={{
                  background:
                    faction === "yellow"
                      ? "radial-gradient(circle at 30% 30%, oklch(0.95 0.15 95), oklch(0.7 0.16 85))"
                      : "radial-gradient(circle at 30% 30%, oklch(0.72 0.18 310), oklch(0.35 0.18 295))",
                  color: faction === "yellow" ? "oklch(0.28 0.08 80)" : "oklch(0.98 0.02 300)",
                  borderColor: faction === "yellow" ? "oklch(0.45 0.12 80)" : "oklch(0.22 0.12 295)",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
