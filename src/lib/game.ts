import {
  BOARD_SIZE,
  DIAMOND_ROWS,
  DIRECTIONS,
  cellName,
  deploymentZone,
  distance,
  inBounds,
  key,
  type Axial,
} from "./hex";

export type Faction = "yellow" | "purple";
export type PieceState = "E" | "M" | "T";
export type PieceKind = "pawn" | "king";

export type Piece = {
  id: string;
  owner: Faction;
  pos: Axial;
  state: PieceState;
  kind: PieceKind;
};

export type GameState = {
  pieces: Record<string, Piece>; // keyed by hex "q,r"
  turn: Faction;
  winner: Faction | null;
  moves: number;
  history: string[]; // human-readable log, one entry per half-move
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

export function needsStateChoice(piece: Piece, steps: 1 | 2): boolean {
  return piece.state === "E" && steps === 2;
}

export function initialState(): GameState {
  const pieces: Record<string, Piece> = {};
  let idCounter = 0;

  const cellsAtDiamondRow = (d: number): Axial[] => {
    const row: Axial[] = [];
    for (let q = 0; q < BOARD_SIZE; q++) {
      const r = d - q;
      if (r >= 0 && r < BOARD_SIZE) row.push({ q, r });
    }
    row.sort((a, b) => a.q - b.q);
    return row;
  };

  const place = (owner: Faction, rows: Array<{ d: number; state: PieceState }>) => {
    for (const { d, state } of rows) {
      const row = cellsAtDiamondRow(d);
      row.forEach((pos, i) => {
        // Middle of the 3-cell "E" row is the King.
        const isKing = state === "E" && row.length === 3 && i === 1;
        const id = `${owner}-${idCounter++}`;
        pieces[key(pos)] = {
          id,
          owner,
          pos,
          state,
          kind: isKing ? "king" : "pawn",
        };
      });
    }
  };

  place("yellow", [
    { d: 0, state: "T" },
    { d: 1, state: "M" },
    { d: 2, state: "E" },
  ]);
  place("purple", [
    { d: DIAMOND_ROWS - 1, state: "T" },
    { d: DIAMOND_ROWS - 2, state: "M" },
    { d: DIAMOND_ROWS - 3, state: "E" },
  ]);

  return {
    pieces,
    turn: "yellow",
    winner: null,
    moves: 0,
    history: [],
  };
}

// Returns the set of legal target cells. Pieces move 1 or 2 in straight
// hex lines and CAN jump. A piece inside its own deployment zone may only
// move to combat-zone (white) cells. Kings CANNOT capture. Landing on an
// opponent is only allowed if the arriving state equals the target's state.
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
      if (fromInOwnDeployment && deploymentZone(target) !== null) continue;

      const occupant = state.pieces[key(target)];
      if (occupant) {
        if (occupant.owner === piece.owner) continue;
        // Kings cannot capture.
        if (piece.kind === "king") continue;
        if (piece.state === "E") {
          if (step === 1) {
            if (occupant.state !== "E") continue;
          } else if (occupant.state === "E") continue;
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
  if (piece.kind === "king") return [];
  return candidates.filter((s) => s === occupant.state);
}

function formatMove(piece: Piece, from: Axial, to: Axial, arriving: PieceState, captured: Piece | null): string {
  const marker = piece.kind === "king" ? "♛" : "";
  const sep = captured ? "x" : "→";
  return `${marker}${cellName(from)}${sep}${cellName(to)}·${arriving}`;
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
  if (occupant && piece.kind === "king") return null;

  let arriving: PieceState;
  if (piece.state === "E" && steps === 2) {
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

  if (occupant && occupant.owner !== piece.owner && occupant.state !== arriving) {
    return null;
  }

  const captured = occupant && occupant.owner !== piece.owner ? occupant : null;

  const newPieces: Record<string, Piece> = { ...state.pieces };
  delete newPieces[key(from)];
  delete newPieces[key(to)];
  newPieces[key(to)] = { ...piece, pos: to, state: arriving };

  // Winner = faction whose opponent's king was captured (or is missing).
  const kings = { yellow: false, purple: false };
  for (const p of Object.values(newPieces)) {
    if (p.kind === "king") kings[p.owner] = true;
  }
  let winner: Faction | null = null;
  if (!kings.yellow && kings.purple) winner = "purple";
  else if (!kings.purple && kings.yellow) winner = "yellow";

  const entry = formatMove(piece, from, to, arriving, captured);

  return {
    pieces: newPieces,
    turn: winner ? state.turn : otherFaction(state.turn),
    winner,
    moves: state.moves + 1,
    history: [...(state.history ?? []), entry],
  };
}

export function piecesOf(state: GameState, faction: Faction): Piece[] {
  return Object.values(state.pieces).filter((p) => p.owner === faction);
}
