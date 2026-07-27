import { BOARD_SIZE, DIRECTIONS, deploymentZone, distance, inBounds, key, type Axial } from "./hex";

export type Faction = "yellow" | "purple";

export type Piece = {
  id: string;
  owner: Faction;
  pos: Axial;
};

export type GameState = {
  pieces: Record<string, Piece>; // keyed by hex "q,r"
  turn: Faction;
  winner: Faction | null;
  moves: number;
};

export function otherFaction(f: Faction): Faction {
  return f === "yellow" ? "purple" : "yellow";
}

// Initial layout: every cell of each side's deployment zone (top/bottom 3
// diamond rows) starts with a piece of that faction. Yellow at the top,
// purple at the bottom, 6 pieces each.
export function initialState(): GameState {
  const pieces: Record<string, Piece> = {};
  let idCounter = 0;

  for (let q = 0; q < BOARD_SIZE; q++) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const pos = { q, r };
      const zone = deploymentZone(pos);
      if (!zone) continue;
      const id = `${zone}-${idCounter++}`;
      pieces[key(pos)] = { id, owner: zone, pos };
    }
  }

  return {
    pieces,
    turn: "yellow",
    winner: null,
    moves: 0,
  };
}

export function legalMoves(state: GameState, from: Axial): Axial[] {
  const piece = state.pieces[key(from)];
  if (!piece) return [];
  if (state.winner) return [];
  if (piece.owner !== state.turn) return [];

  const results: Axial[] = [];
  // Straight-line moves of 1 or 2 steps along one of the 6 hex axes.
  for (const dir of DIRECTIONS) {
    for (let step = 1; step <= 2; step++) {
      const target = { q: from.q + dir.q * step, r: from.r + dir.r * step };
      if (!inBounds(target)) break;

      // For a 2-step move, the intermediate cell must be empty (no jumping).
      if (step === 2) {
        const mid = { q: from.q + dir.q, r: from.r + dir.r };
        if (state.pieces[key(mid)]) break;
      }

      const occupant = state.pieces[key(target)];
      if (occupant && occupant.owner === piece.owner) break;
      results.push(target);
      if (occupant) break; // capture ends the ray
    }
  }
  return results;
}

export function applyMove(state: GameState, from: Axial, to: Axial): GameState | null {
  const legal = legalMoves(state, from);
  if (!legal.some((m) => m.q === to.q && m.r === to.r)) return null;
  // sanity: distance must be 1 or 2 (kept for defensive callers)
  if (distance(from, to) < 1 || distance(from, to) > 2) return null;

  const piece = state.pieces[key(from)];
  if (!piece) return null;

  const newPieces: Record<string, Piece> = { ...state.pieces };
  delete newPieces[key(from)];
  delete newPieces[key(to)];
  newPieces[key(to)] = { ...piece, pos: to };

  const remaining = { yellow: 0, purple: 0 };
  for (const p of Object.values(newPieces)) remaining[p.owner]++;

  let winner: Faction | null = null;
  if (remaining.yellow === 0) winner = "purple";
  else if (remaining.purple === 0) winner = "yellow";

  return {
    pieces: newPieces,
    turn: winner ? state.turn : otherFaction(state.turn),
    winner,
    moves: state.moves + 1,
  };
}

export function piecesOf(state: GameState, faction: Faction): Piece[] {
  return Object.values(state.pieces).filter((p) => p.owner === faction);
}
