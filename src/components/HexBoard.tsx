import { useMemo, useState } from "react";
import {
  allCells,
  axialToPixel,
  boardPixelBounds,
  cellName,
  deploymentZone,
  distance,
  hexCorners,
  key,
  type Axial,
} from "@/lib/hex";
import { legalMoves, legalStateChoices, type Faction, type GameState } from "@/lib/game";

type Props = {
  state: GameState;
  selected: Axial | null;
  onSelect: (a: Axial | null) => void;
  onMove: (from: Axial, to: Axial, chosen?: "M" | "T") => void;
  perspective?: Faction;
  disabled?: boolean;
};

const HEX_SIZE = 34;

export function HexBoard({ state, selected, onSelect, onMove, perspective = "yellow", disabled }: Props) {
  const bounds = useMemo(() => boardPixelBounds(HEX_SIZE), []);
  const cells = useMemo(() => allCells(), []);
  const targets = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(legalMoves(state, selected).map(key));
  }, [state, selected]);

  // For E + 2 steps on an empty cell we need to ask the player M or T.
  const [pending, setPending] = useState<{ from: Axial; to: Axial } | null>(null);

  const rotation = perspective === "purple" ? 180 : 0;

  const handleCellClick = (cell: Axial) => {
    if (disabled) return;
    const k = key(cell);
    const piece = state.pieces[k];

    if (selected) {
      const isTarget = targets.has(k);
      if (isTarget) {
        const choices = legalStateChoices(state, selected, cell);
        if (choices.length > 1) {
          setPending({ from: selected, to: cell });
          return;
        }
        onMove(selected, cell);
        return;
      }
      if (piece && piece.owner === state.turn) {
        onSelect(cell);
        return;
      }
      onSelect(null);
      return;
    }

    if (piece && piece.owner === state.turn) {
      onSelect(cell);
    }
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${bounds.width} ${bounds.height}`}
        className="w-full h-auto max-w-[560px] mx-auto"
        style={{ transform: `rotate(${rotation}deg)` }}
        role="img"
        aria-label="Plancia esagonale"
      >
        <defs>
          <radialGradient id="piece-yellow" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="oklch(0.95 0.15 95)" />
            <stop offset="60%" stopColor="oklch(0.82 0.18 90)" />
            <stop offset="100%" stopColor="oklch(0.58 0.15 80)" />
          </radialGradient>
          <radialGradient id="piece-purple" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="oklch(0.72 0.18 310)" />
            <stop offset="60%" stopColor="oklch(0.48 0.22 300)" />
            <stop offset="100%" stopColor="oklch(0.28 0.15 295)" />
          </radialGradient>
        </defs>

        {cells.map((cell) => {
          const { x, y } = axialToPixel(cell, HEX_SIZE);
          const cx = x + bounds.offsetX;
          const cy = y + bounds.offsetY;
          const k = key(cell);
          const piece = state.pieces[k];
          const isSelected = selected && selected.q === cell.q && selected.r === cell.r;
          const isTarget = targets.has(k);
          const isCapture = isTarget && piece;
          const zone = deploymentZone(cell);
          const fill =
            zone === "yellow"
              ? "oklch(0.96 0.06 92)"
              : zone === "purple"
                ? "oklch(0.92 0.05 305)"
                : "oklch(0.99 0.005 100)";

          const steps = selected && isTarget ? (distance(selected, cell) as 1 | 2) : null;

          return (
            <g key={k} onClick={() => handleCellClick(cell)} style={{ cursor: disabled ? "default" : "pointer" }}>
              <polygon
                points={hexCorners(cx, cy, HEX_SIZE - 1)}
                fill={fill}
                stroke={isSelected ? "oklch(0.55 0.22 300)" : "oklch(0.65 0.02 90 / 0.55)"}
                strokeWidth={isSelected ? 3 : 1}
              />
              {isTarget && !isCapture && (
                <circle cx={cx} cy={cy} r={HEX_SIZE * 0.28} fill="oklch(0.55 0.22 300 / 0.35)" />
              )}
              {isTarget && isCapture && (
                <polygon
                  points={hexCorners(cx, cy, HEX_SIZE - 3)}
                  fill="none"
                  stroke="oklch(0.62 0.24 25)"
                  strokeWidth={3}
                  strokeDasharray="4 3"
                />
              )}
              {isTarget && steps && (
                <text
                  x={cx + HEX_SIZE * 0.55}
                  y={cy - HEX_SIZE * 0.55}
                  fontSize={HEX_SIZE * 0.35}
                  fill="oklch(0.45 0.15 300)"
                  textAnchor="middle"
                  style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}
                >
                  {steps}
                </text>
              )}
              {piece && (
                <g style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
                  <circle cx={cx} cy={cy + 2} r={HEX_SIZE * 0.55} fill="oklch(0 0 0 / 0.25)" />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={HEX_SIZE * 0.55}
                    fill={piece.owner === "yellow" ? "url(#piece-yellow)" : "url(#piece-purple)"}
                    stroke={piece.owner === "yellow" ? "oklch(0.45 0.12 80)" : "oklch(0.22 0.12 295)"}
                    strokeWidth={1.5}
                  />
                  <text
                    x={cx}
                    y={cy + HEX_SIZE * 0.14}
                    fontSize={HEX_SIZE * 0.5}
                    fontWeight={700}
                    textAnchor="middle"
                    fill={piece.owner === "yellow" ? "oklch(0.28 0.08 80)" : "oklch(0.98 0.02 300)"}
                    style={{ pointerEvents: "none", fontFamily: "ui-serif, Georgia, serif" }}
                  >
                    {piece.state}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {pending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-lg text-center max-w-xs">
            <p className="mb-4 text-sm">
              Scegli lo stato di arrivo della pedina (mossa di 2 passi da <strong>E</strong>).
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => { const p = pending; setPending(null); onMove(p.from, p.to, "M"); }}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
              >
                M
              </button>
              <button
                onClick={() => { const p = pending; setPending(null); onMove(p.from, p.to, "T"); }}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
              >
                T
              </button>
              <button
                onClick={() => setPending(null)}
                className="rounded-full border border-border px-5 py-2 text-sm font-medium hover:bg-accent transition"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
