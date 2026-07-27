import { useMemo } from "react";
import {
  allCells,
  axialToPixel,
  boardPixelBounds,
  deploymentZone,
  hexCorners,
  key,
  type Axial,
} from "@/lib/hex";
import { legalMoves, type Faction, type GameState } from "@/lib/game";

type Props = {
  state: GameState;
  selected: Axial | null;
  onSelect: (a: Axial | null) => void;
  onMove: (from: Axial, to: Axial) => void;
  perspective?: Faction; // rotate so this faction sits at the bottom
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

  // Rotate the SVG so purple sees the board from the opposite side.
  const rotation = perspective === "purple" ? 180 : 0;

  const handleCellClick = (cell: Axial) => {
    if (disabled) return;
    const k = key(cell);
    const piece = state.pieces[k];

    if (selected) {
      const isTarget = targets.has(k);
      if (isTarget) {
        onMove(selected, cell);
        return;
      }
      // Reselect own piece
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
    <svg
      viewBox={`0 0 ${bounds.width} ${bounds.height}`}
      className="w-full h-auto max-w-[560px] mx-auto"
      style={{ transform: `rotate(${rotation}deg)` }}
      role="img"
      aria-label="Plancia esagonale"
    >
      <defs>
        <radialGradient id="cell-light" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="oklch(0.98 0.01 90)" />
          <stop offset="100%" stopColor="oklch(0.92 0.02 90)" />
        </radialGradient>
        <radialGradient id="cell-dark" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="oklch(0.90 0.02 300)" />
          <stop offset="100%" stopColor="oklch(0.82 0.03 300)" />
        </radialGradient>
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
        // Deployment zones are tinted light yellow / light purple; the rest is white.
        const zone = deploymentZone(cell);
        const fill =
          zone === "yellow"
            ? "oklch(0.96 0.06 92)"
            : zone === "purple"
              ? "oklch(0.92 0.05 305)"
              : "oklch(0.99 0.005 100)";

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
            {piece && (
              <g style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
                <circle
                  cx={cx}
                  cy={cy + 2}
                  r={HEX_SIZE * 0.55}
                  fill="oklch(0 0 0 / 0.25)"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={HEX_SIZE * 0.55}
                  fill={piece.owner === "yellow" ? "url(#piece-yellow)" : "url(#piece-purple)"}
                  stroke={piece.owner === "yellow" ? "oklch(0.45 0.12 80)" : "oklch(0.22 0.12 295)"}
                  strokeWidth={1.5}
                />
                <circle
                  cx={cx - HEX_SIZE * 0.15}
                  cy={cy - HEX_SIZE * 0.18}
                  r={HEX_SIZE * 0.15}
                  fill="oklch(1 0 0 / 0.35)"
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
