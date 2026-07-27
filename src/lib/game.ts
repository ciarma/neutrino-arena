import { BOARD_SIZE, distance, inBounds, key, type Axial } from "./hex";

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

// Initial layout: 5 pieces per side placed along their home edge.
// Yellow occupies r = 0 row (top of rhombus), purple occupies r = BOARD_SIZE - 1 (bottom).
export function initialState(): GameState {
  const pieces: Record<string, Piece> = {};
  let idCounter = 0;
  const makeId = (f: Faction) => `${f}-${idCounter++}`;

  // Yellow: first row (r = 0), skip corners for a nicer starting spread
  const yellowRow: Axial[] = [];
  for (let q = 1; q < BOARD_SIZE - 1; q++) yellowRow.push({ q, r: 0 });
  // Purple: last row (r = N-1)
  const purpleRow: Axial[] = [];
  for (let q = 1; q < BOARD_SIZE - 1; q++) purpleRow.push({ q, r: BOARD_SIZE - 1 });

  for (const pos of yellowRow) {
    const id = makeId("yellow");
    pieces[key(pos)] = { id, owner: "yellow", pos };
  }
  for (const pos of purpleRow) {
    const id = makeId("purple");
    pieces[key(pos)] = { id, owner: "purple", pos };
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
  for (let q = 0; q < BOARD_SIZE; q++) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const target = { q, r };
      if (!inBounds(target)) continue;
      const d = distance(from, target);
      if (d < 1 || d > 2) continue;
      const occupant = state.pieces[key(target)];
      if (occupant && occupant.owner === piece.owner) continue;
      results.push(target);
    }
  }
  return results;
}

export function applyMove(state: GameState, from: Axial, to: Axial): GameState | null {
  const legal = legalMoves(state, from);
  if (!legal.some((m) => m.q === to.q && m.r === to.r)) return null;

  const piece = state.pieces[key(from)];
  if (!piece) return null;

  const newPieces: Record<string, Piece> = { ...state.pieces };
  delete newPieces[key(from)];
  // Capture any piece on target
  delete newPieces[key(to)];
  newPieces[key(to)] = { ...piece, pos: to };

  // Count remaining
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
