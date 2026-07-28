// Hex grid utilities for a 5x5 board displayed as a vertical diamond.
// Underlying storage uses axial coordinates (q, r) both in [0, BOARD_SIZE - 1].
// Visually, diamond rows correspond to (q + r): rows have widths 1,2,3,4,5,4,3,2,1.

export const BOARD_SIZE = 5;
export const DIAMOND_ROWS = BOARD_SIZE * 2 - 1; // 9
export const DEPLOYMENT_DEPTH = 3; // first / last 3 diamond rows

export type Axial = { q: number; r: number };

// The 6 hex axis directions (used for straight-line movement).
export const DIRECTIONS: Axial[] = [
  { q: 1, r: 0 },
  { q: -1, r: 0 },
  { q: 0, r: 1 },
  { q: 0, r: -1 },
  { q: 1, r: -1 },
  { q: -1, r: 1 },
];

export function key(a: Axial): string {
  return `${a.q},${a.r}`;
}

export function fromKey(k: string): Axial {
  const [q, r] = k.split(",").map(Number);
  return { q, r };
}

export function inBounds(a: Axial): boolean {
  return a.q >= 0 && a.q < BOARD_SIZE && a.r >= 0 && a.r < BOARD_SIZE;
}

export function distance(a: Axial, b: Axial): number {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
}

export function allCells(): Axial[] {
  const cells: Axial[] = [];
  for (let q = 0; q < BOARD_SIZE; q++) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      cells.push({ q, r });
    }
  }
  return cells;
}

// Chess-like coordinate: file letter from q (a..e), rank number from r (1..5).
export function cellName(a: Axial): string {
  return `${String.fromCharCode(97 + a.q)}${a.r + 1}`;
}

// Diamond row index (0 at top, DIAMOND_ROWS - 1 at bottom).
export function diamondRow(a: Axial): number {
  return a.q + a.r;
}

export type Faction = "yellow" | "purple";

// Yellow deployment = top rows; purple deployment = bottom rows.
export function deploymentZone(a: Axial): Faction | null {
  const d = diamondRow(a);
  if (d < DEPLOYMENT_DEPTH) return "yellow";
  if (d > DIAMOND_ROWS - 1 - DEPLOYMENT_DEPTH) return "purple";
  return null;
}

// Pixel mapping: vertical diamond.
// Pointy-top hexes: horizontal spacing sqrt(3)*s between neighbours in the same
// diamond row (which differ by (dq, dr) = (-1, +1) → (r - q) changes by 2).
// Vertical spacing 1.5*s between adjacent diamond rows.
export function axialToPixel(a: Axial, size: number): { x: number; y: number } {
  const x = (size * Math.sqrt(3) / 2) * (a.r - a.q);
  const y = size * 1.5 * (a.q + a.r);
  return { x, y };
}

export function boardPixelBounds(size: number): { width: number; height: number; offsetX: number; offsetY: number } {
  const points = allCells().map((c) => axialToPixel(c, size));
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs) - size * Math.sqrt(3) / 2;
  const maxX = Math.max(...xs) + size * Math.sqrt(3) / 2;
  const minY = Math.min(...ys) - size;
  const maxY = Math.max(...ys) + size;
  return {
    width: maxX - minX,
    height: maxY - minY,
    offsetX: -minX,
    offsetY: -minY,
  };
}

export function hexCorners(cx: number, cy: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}
