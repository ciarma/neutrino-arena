import { reservesOf, type Faction, type GameState, type PieceState } from "@/lib/game";
import { pieceImage } from "@/lib/piece-images";
import { useI18n } from "@/lib/i18n";

type Props = {
  state: GameState;
  faction: Faction;
  label?: string;
  selected?: PieceState | null;
  onSelect?: (s: PieceState | null) => void;
  interactive?: boolean;
  /** Keyboard focus position inside this tray (null = no keyboard focus). */
  focusIndex?: number | null;
};

export function ReserveTray({ state, faction, label, selected = null, onSelect, interactive, focusIndex = null }: Props) {
  const { t } = useI18n();
  const reserve = reservesOf(state, faction);
  const name = faction === "yellow" ? t("faction.yellow") : t("faction.purple");
  const canAct = !!interactive && !state.winner && state.turn === faction;
  const turnColor = state.turn === "yellow" ? "oklch(0.82 0.18 90)" : "oklch(0.55 0.22 300)";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-background/40 px-3 py-2">
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {label ?? t("reserve.of", { faction: name })}
      </span>
      {reserve.length === 0 ? (
        <span className="text-xs text-muted-foreground">{t("reserve.empty")}</span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {reserve.map((s, i) => {
            const isSelected = canAct && selected === s;
            const isFocused = focusIndex === i;
            return (
              <button
                key={`${s}-${i}`}
                type="button"
                disabled={!canAct}
                onClick={() => onSelect?.(isSelected ? null : s)}
                title={canAct ? t("reserve.hint") : undefined}
                style={isFocused ? { outline: `3px solid ${turnColor}`, outlineOffset: 2, boxShadow: `0 0 12px ${turnColor}`, borderRadius: 9999 } : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  isSelected ? "ring-2 ring-offset-1 ring-offset-background ring-primary" : ""
                } ${canAct ? "cursor-pointer hover:opacity-90" : "cursor-default opacity-80"}`}
              >

                <img
                  src={pieceImage(faction, "pawn", s)}
                  alt={t("reserve.alt", { faction: name, state: s })}
                  className="h-full w-full object-contain"
                />
              </button>

            );
          })}
        </div>
      )}
    </div>
  );
}
