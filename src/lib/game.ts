import { BOARD_SIZE, DIRECTIONS, deploymentZone, distance, inBounds, key, type Axial } from "./hex";

export type Faction = "yellow" | "purple";
export type PieceState = "E" | "M" | "T";

export type Piece = {
  id: string;
  owner: Faction;
  pos: Axial;
  state: PieceState;
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

// Deterministic state transitions. For E moving 2 steps the caller chooses
// M or T, so this returns null in that case.
export function nextState(current: PieceState, steps: 1 | 2, chosen?: "M" | "T"): PieceState | null {
  if (current === "E") {
    if (steps === 1) return "E";
    return chosen ?? null;
  }
  if (current === "M") return steps === 1 ? "T" : "E";
  // T
  return steps === 1 ? "M" : "E";
}

// True iff the E piece needs the player to pick M or T for a 2-step move.
export function needsStateChoice(piece: Piece, steps: 1 | 2): boolean {
  return piece.state === "E" && steps === 2;
}

export function initialState(): GameState {
  const pieces: Record<string, Piece> = {};
  let idCounter = 0;

  for (let q = 0; q < BOARD_SIZE; q++) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const pos = { q, r };
      const zone = deploymentZone(pos);
      if (!zone) continue;
      const id = `${zone}-${idCounter++}`;
      pieces[key(pos)] = { id, owner: zone, pos, state: "E" };
    }
  }

  return {
    pieces,
    turn: "yellow",
    winner: null,
    moves: 0,
  };
}

// Returns the set of legal target cells. Pieces move 1 or 2 in straight
// hex lines and CAN jump over other pieces. A piece currently inside its
// own deployment zone may only move to combat-zone (white) cells. Landing
// on an opponent is only allowed if the arriving state equals the target's
// state (capture); landing on an own piece is always blocked.
export function legalMoves(state: GameState, from: Axial): Axial[] {
  const piece = state.pieces[key(from)];
  if (!piece) return [];
  if (state.winner) return [];
  if (piece.owner !== state.turn) return [];

  const fromInOwnDeployment = deploymentZone(from) === piece.owner;

  const results: Axial[] = [];
  for (const dir of DIRECTIONS) {
    for (let step = 1 as 1 | 2; step <= 2; step = (step + 1) as 1 | 2) {
      const target = { q: from.q + dir.q * step, r: from.r + dir.r * step };
      if (!inBounds(target)) continue;

      // Deployment zone restriction: can only move into combat (white) cells.
      if (fromInOwnDeployment && deploymentZone(target) !== null) continue;

      const occupant = state.pieces[key(target)];
      if (occupant) {
        if (occupant.owner === piece.owner) continue;
        // Opponent: capture requires a matching final state.
        if (piece.state === "E") {
          if (step === 1) {
            // E + 1 -> E ; capture only if opponent is E
            if (occupant.state !== "E") continue;
          }
          // E + 2 -> chosen M or T ; ok if opponent is M or T (player can pick)
          else if (occupant.state === "E") continue;
        } else {
          const ns = nextState(piece.state, step);
          if (ns !== occupant.state) continue;
        }
      }
      results.push(target);
    }
  }
  return results;
}

// Legal state choices when moving `piece` by `steps`, given the target cell.
// Returns [] if the move is illegal, or the list of possible resulting states
// (length 1 for deterministic moves, up to 2 for E + 2 steps).
export function legalStateChoices(state: GameState, from: Axial, to: Axial): PieceState[] {
  const piece = state.pieces[key(from)];
  if (!piece) return [];
  const d = distance(from, to);
  if (d !== 1 && d !== 2) return [];
  const steps = d as 1 | 2;
  const occupant = state.pieces[key(to)];
  const candidates: PieceState[] =
    piece.state === "E" && steps === 2
      ? ["M", "T"]
      : [nextState(piece.state, steps)!];
  if (!occupant) return candidates;
  if (occupant.owner === piece.owner) return [];
  return candidates.filter((s) => s === occupant.state);
}

export function applyMove(
  state: GameState,
  from: Axial,
  to: Axial,
  chosen?: "M" | "T",
): GameState | null {
  const legal = legalMoves(state, from);
  if (!legal.some((m) => m.q === to.q && m.r === to.r)) return null;

  const d = distance(from, to);
  if (d !== 1 && d !== 2) return null;
  const steps = d as 1 | 2;

  const piece = state.pieces[key(from)];
  if (!piece) return null;

  const occupant = state.pieces[key(to)];

  // Resolve arriving state.
  let arriving: PieceState;
  if (piece.state === "E" && steps === 2) {
    // For E-2: prefer the caller's choice; if there's an opponent to capture,
    // it must match the opponent's state.
    if (occupant && occupant.owner !== piece.owner) {
      if (occupant.state !== "M" && occupant.state !== "T") return null;
      arriving = occupant.state;
    } else {
      if (chosen !== "M" && chosen !== "T") return null;
      arriving = chosen;
    }
  } else {
    const ns = nextState(piece.state, steps);
    if (!ns) return null;
    arriving = ns;
  }

  // Final capture legality check (defensive).
  if (occupant && occupant.owner !== piece.owner && occupant.state !== arriving) {
    return null;
  }

  const newPieces: Record<string, Piece> = { ...state.pieces };
  delete newPieces[key(from)];
  delete newPieces[key(to)];
  newPieces[key(to)] = { ...piece, pos: to, state: arriving };

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
