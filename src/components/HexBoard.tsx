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
import { isInCheck, legalDrops, legalMoves, legalStateChoices, type Faction, type GameState, type PieceState } from "@/lib/game";
import { pieceImage } from "@/lib/piece-images";

type Props = {
  state: GameState;
  selected: Axial | null;
  onSelect: (a: Axial | null) => void;
  onMove: (from: Axial, to: Axial, chosen?: "M" | "T") => void;
  perspective?: Faction;
  disabled?: boolean;
  dropState?: PieceState | null;
  onDrop?: (to: Axial) => void;
};

const HEX_SIZE = 34;

export function HexBoard({ state, selected, onSelect, onMove, perspective = "yellow", disabled, dropState = null, onDrop }: Props) {
  const bounds = useMemo(() => boardPixelBounds(HEX_SIZE), []);
  const cells = useMemo(() => allCells(), []);
  const dropTargets = useMemo(() => {
    if (!dropState) return new Set<string>();
    return new Set(legalDrops(state, state.turn, dropState).map(key));
  }, [state, dropState]);
  const targets = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(legalMoves(state, selected).map(key));
  }, [state, selected]);
  // King currently under check (highlighted on the board).
  const checkedKingKey = useMemo(() => {
    for (const f of ["yellow", "purple"] as Faction[]) {
      if (!isInCheck(state, f)) continue;
      const king = Object.values(state.pieces).find((p) => p.kind === "king" && p.owner === f);
      if (king) return key(king.pos);
    }
    return null;
  }, [state]);


  // For E + 2 steps on an empty cell we need to ask the player M or T.
  const [pending, setPending] = useState<{ from: Axial; to: Axial; choices: PieceState[] } | null>(null);

  // Board is stored with yellow on top; flip it so the viewing faction sits at
  // the bottom (default view: yellow below, purple above).
  const rotation = perspective === "purple" ? 0 : 180;

  const handleCellClick = (cell: Axial) => {
    if (disabled) return;
    const k = key(cell);
    const piece = state.pieces[k];

    if (dropState) {
      if (dropTargets.has(k)) onDrop?.(cell);
      return;
    }

    if (selected) {
      const isTarget = targets.has(k);
      if (isTarget) {
        const choices = legalStateChoices(state, selected, cell);
        if (choices.length > 1) {
          setPending({ from: selected, to: cell, choices });
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
    <div className="relative mx-auto max-w-[560px] overflow-hidden rounded-2xl">
      <img
        src="/board-bg.png"
        alt=""
        className="absolute inset-0 z-0 h-full w-full object-cover"
        loading="lazy"
        width={560}
        height={907}
      />
      <svg
        viewBox={`0 0 ${bounds.width} ${bounds.height}`}
        className="relative z-10 h-auto w-full"
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
          const isDropTarget = dropTargets.has(k);
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
          const isCheckedKing = checkedKingKey === k;

          return (
            <g key={k} onClick={() => handleCellClick(cell)} style={{ cursor: disabled ? "default" : "pointer" }}>
              <polygon
                points={hexCorners(cx, cy, HEX_SIZE - 1)}
                fill={isCheckedKing ? "oklch(0.88 0.13 25)" : fill}
                stroke={
                  isCheckedKing
                    ? "oklch(0.58 0.24 25)"
                    : isSelected
                      ? "oklch(0.55 0.22 300)"
                      : isDropTarget
                        ? "oklch(0.62 0.2 150)"
                        : "oklch(0.65 0.02 90 / 0.55)"
                }
                strokeWidth={isCheckedKing || isSelected || isDropTarget ? 3 : 1}
              />
              {isCheckedKing && (
                <polygon
                  points={hexCorners(cx, cy, HEX_SIZE - 4)}
                  fill="none"
                  stroke="oklch(0.58 0.24 25)"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                >
                  <animate attributeName="opacity" values="1;0.25;1" dur="1.2s" repeatCount="indefinite" />
                </polygon>
              )}
              {isDropTarget && (
                <circle cx={cx} cy={cy} r={HEX_SIZE * 0.3} fill="oklch(0.62 0.2 150 / 0.3)" />
              )}

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
                  <ellipse cx={cx} cy={cy + HEX_SIZE * 0.62} rx={HEX_SIZE * 0.45} ry={HEX_SIZE * 0.14} fill="oklch(0 0 0 / 0.2)" />
                  <image
                    href={pieceImage(piece.owner, piece.kind, piece.state)}
                    x={cx - HEX_SIZE * 0.62}
                    y={cy - HEX_SIZE * 0.62}
                    width={HEX_SIZE * 1.24}
                    height={HEX_SIZE * 1.24}
                    style={{ pointerEvents: "none" }}
                  />
                </g>
              )}

              {!piece && (
                <text
                  x={cx}
                  y={cy + HEX_SIZE * 0.12}
                  fontSize={HEX_SIZE * 0.28}
                  textAnchor="middle"
                  fill="oklch(0.6 0.02 90 / 0.6)"
                  style={{
                    pointerEvents: "none",
                    fontFamily: "ui-monospace, Menlo, monospace",
                    transform: `rotate(${-rotation}deg)`,
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                >
                  {cellName(cell)}
                </text>
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
              {(["M", "T"] as const)
                .filter((s) => pending.choices.includes(s))
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => { const p = pending; setPending(null); onMove(p.from, p.to, s); }}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
                  >
                    {s}
                  </button>
                ))}
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
