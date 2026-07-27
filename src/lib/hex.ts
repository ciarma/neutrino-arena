// Hex grid utilities for a rhombus-shaped board using axial coordinates.
// The board is an N x N rhombus: q in [0, N-1], r in [0, N-1].

export const BOARD_SIZE = 7;

export type Axial = { q: number; r: number };

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

// Convert axial to pixel using pointy-top orientation.
// The rhombus is laid so q grows to the right and r grows down-right,
// producing a diamond visual.
export function axialToPixel(a: Axial, size: number): { x: number; y: number } {
  const x = size * Math.sqrt(3) * (a.q + a.r / 2);
  const y = size * (3 / 2) * a.r;
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
