import {
  BOARD_SIZE,
  allCells,
  DIAMOND_ROWS,
  DIRECTIONS,
  cellName,
  deploymentZone,
  diamondRow,
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
  // Captured enemy pieces held by each faction, ready to be redeployed.
  reserves: Record<Faction, PieceState[]>;
  turn: Faction;
  // Faction that moved first in this game (needed to align the move log).
  first?: Faction;
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

  const first: Faction = firstFaction ?? (Math.random() < 0.5 ? "yellow" : "purple");

  return {
    pieces,
    reserves: { yellow: [], purple: [] },
    turn: first,
    first,
    winner: null,
    moves: 0,
    history: [],
  };
}

// Forward direction for a faction (toward the enemy back rank).
function isForwardMove(owner: Faction, from: Axial, to: Axial): boolean {
  const df = diamondRow(from);
  const dt = diamondRow(to);
  return owner === "yellow" ? dt > df : dt < df;
}

// Would a piece at `pos` with arriving `state` threaten the enemy king
// (i.e. be able to capture it in a single 1- or 2-step straight-line move)?
function threatensEnemyKing(
  gs: GameState,
  mover: Piece,
  pos: Axial,
  arriving: PieceState,
): boolean {
  //if (mover.kind === "king") return false; // kings cannot capture
  const enemy = otherFaction(mover.owner);
  const king = Object.values(gs.pieces).find((p) => p.kind === "king" && p.owner === enemy);
  if (!king) return false;
  for (const dir of DIRECTIONS) {
    for (const step of [1, 2] as const) {
      const t = { q: pos.q + dir.q * step, r: pos.r + dir.r * step };
      if (t.q !== king.pos.q || t.r !== king.pos.r) continue;
      if (arriving === "E" && step === 2) {
        if (king.state === "M" || king.state === "T") return true;
      } else {
        const ns = nextState(arriving, step);
        if (ns === king.state) return true;
      }
    }
  }
  return false;
}

export type PseudoMove = { to: Axial; arriving: PieceState };

// All geometrically/zone-legal moves for a piece, ignoring turn order and
// ignoring whether the move leaves one's own king in check.
function pseudoMoves(state: GameState, from: Axial, includeKingThreats = false): PseudoMove[] {
  const piece = state.pieces[key(from)];
  if (!piece) return [];

  const fromInOwnDeployment = deploymentZone(from) === piece.owner;
  const fromInCombat = deploymentZone(from) === null;

  const results: PseudoMove[] = [];
  for (const dir of DIRECTIONS) {
    for (let step = 1 as 1 | 2; step <= 2; step = (step + 1) as 1 | 2) {
      const target = { q: from.q + dir.q * step, r: from.r + dir.r * step };
      if (!inBounds(target)) continue;

      if (fromInOwnDeployment && !isForwardMove(piece.owner, from, target)) continue;
      /*
      const targetZone = deploymentZone(target);
      let arrivingCandidates: PieceState[] =
        piece.state === "E" && step === 2 ? ["M", "T"] : [nextState(piece.state, step)!];

      if (fromInCombat && targetZone !== null) {
        if (targetZone === piece.owner) continue;
        arrivingCandidates = arrivingCandidates.filter((s) =>
          threatensEnemyKing(state, piece, target, s),
        );
        if (arrivingCandidates.length === 0) continue;
      }

      const occupant = state.pieces[key(target)];
      */

      const targetZone = deploymentZone(target);
      const occupant = state.pieces[key(target)];

      let arrivingCandidates: PieceState[] =
        piece.state === "E" && step === 2
          ? ["M", "T"]
          : [nextState(piece.state, step)!];

      //Una pedina uscita dagli schieramenti non può fisicamente entrare in nessuna zona di schieramento.
      //Durante il calcolo dello scacco, però, permettiamo di generare la minaccia teorica verso un re che si trova lì.
      if (
        fromInCombat &&
        targetZone !== null &&
        !includeKingThreats
      ) {
        continue;
      }

      if (occupant) {
        if (occupant.owner === piece.owner) continue;
        if (piece.kind === "king") {
          if (!includeKingThreats || occupant.kind !== "king") {
            continue;
          }
        }
        arrivingCandidates = arrivingCandidates.filter((s) => s === occupant.state,);
        if (arrivingCandidates.length === 0) continue;
      }

      for (const s of arrivingCandidates) results.push({ to: target, arriving: s });
    }
  }
  return results;
}

function findKing(state: GameState, faction: Faction): Piece | undefined {
  return Object.values(state.pieces).find((p) => p.kind === "king" && p.owner === faction);
}

// Is `faction`'s king currently attacked by the opponent?
export function isInCheck(state: GameState, faction: Faction): boolean {
  const king = findKing(state, faction);
  if (!king) return false;
  for (const p of Object.values(state.pieces)) {
    if (p.owner === faction) continue;
    for (const m of pseudoMoves(state, p.pos, true)) {
      if (m.to.q === king.pos.q && m.to.r === king.pos.r) return true;
    }
  }
  return false;
}

// Board after a raw move, used to test check-safety.
function simulate(state: GameState, from: Axial, to: Axial, arriving: PieceState): GameState {
  const piece = state.pieces[key(from)];
  const newPieces: Record<string, Piece> = { ...state.pieces };
  delete newPieces[key(from)];
  delete newPieces[key(to)];
  newPieces[key(to)] = { ...piece, pos: to, state: arriving };
  return { ...state, pieces: newPieces };
}

function simulateDrop(state: GameState, faction: Faction, s: PieceState, to: Axial): GameState {
  const newPieces: Record<string, Piece> = { ...state.pieces };
  newPieces[key(to)] = {
    id: `sim-${key(to)}`,
    owner: faction,
    pos: to,
    state: s,
    kind: "pawn",
  };
  return { ...state, pieces: newPieces };
}

function isSafe(state: GameState, owner: Faction, from: Axial, to: Axial, arriving: PieceState): boolean {
  return !isInCheck(simulate(state, from, to, arriving), owner);
}

// Returns the set of legal target cells. Pieces move 1 or 2 in straight
// hex lines and CAN jump. Movement rules:
//  - From own deployment zone: only forward (toward the opponent's side).
//  - From combat zone: cannot enter any deployment cell, EXCEPT to give
//    check to the enemy king (own deployment is never re-enterable).
//  - Kings CANNOT capture. Landing on an opponent is only allowed if the
//    arriving state equals the target's state.
//  - A move may never leave (or keep) one's own king in check.
export function legalMoves(state: GameState, from: Axial): Axial[] {
  const piece = state.pieces[key(from)];
  if (!piece) return [];
  if (state.winner) return [];
  if (piece.owner !== state.turn) return [];

  const seen = new Set<string>();
  const results: Axial[] = [];
  for (const m of pseudoMoves(state, from)) {
    if (!isSafe(state, piece.owner, from, m.to, m.arriving)) continue;
    const k = key(m.to);
    if (seen.has(k)) continue;
    seen.add(k);
    results.push(m.to);
  }
  return results;
}

export function legalStateChoices(state: GameState, from: Axial, to: Axial): PieceState[] {
  const piece = state.pieces[key(from)];
  if (!piece) return [];
  return pseudoMoves(state, from)
    .filter((m) => m.to.q === to.q && m.to.r === to.r)
    .filter((m) => isSafe(state, piece.owner, from, m.to, m.arriving))
    .map((m) => m.arriving);
}

// Does the faction have any legal action left (move or drop)?
export function hasAnyLegalAction(state: GameState, faction: Faction): boolean {
  for (const p of Object.values(state.pieces)) {
    if (p.owner !== faction) continue;
    for (const m of pseudoMoves(state, p.pos)) {
      if (isSafe(state, faction, p.pos, m.to, m.arriving)) return true;
    }
  }
  const reserve = reservesOf(state, faction);
  if (reserve.length > 0) {
    for (const c of allCells()) {
      if (deploymentZone(c) !== faction || state.pieces[key(c)]) continue;
      for (const s of reserve) {
        if (!isInCheck(simulateDrop(state, faction, s, c), faction)) return true;
      }
    }
  }
  return false;
}

export function isCheckmate(state: GameState, faction: Faction): boolean {
  return isInCheck(state, faction) && !hasAnyLegalAction(state, faction);
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

  const choices = legalStateChoices(state, from, to);
  if (choices.length === 0) return null;

  let arriving: PieceState;
  /*
  if (piece.state === "E" && steps === 2) {
    if (occupant && occupant.owner !== piece.owner) {
      if (!choices.includes(occupant.state)) return null;
      arriving = occupant.state;
    } else {
      if (chosen !== "M" && chosen !== "T") return null;
      if (!choices.includes(chosen)) return null;
      arriving = chosen;
    }
  } else {
    arriving = choices[0];
  }
  */
  
  if (piece.state === "E" && steps === 2) {
    if (occupant && occupant.owner !== piece.owner) {
      if (!choices.includes(occupant.state)) return null;
      arriving = occupant.state;
    } else if (choices.length === 1) {
      // Una sola trasformazione è sicura: applicala automaticamente.
      arriving = choices[0];
    } else {
      // Entrambe M e T sono sicure: serve la scelta del giocatore.
      if (chosen !== "M" && chosen !== "T") return null;
      if (!choices.includes(chosen)) return null;
      arriving = chosen;
    }
  } else {
    arriving = choices[0];
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

  const newReserves: Record<Faction, PieceState[]> = {
    yellow: [...reservesOf(state, "yellow")],
    purple: [...reservesOf(state, "purple")],
  };
  if (captured && captured.kind !== "king") {
    newReserves[piece.owner] = [...newReserves[piece.owner], captured.state];
  }

  const opponent = otherFaction(piece.owner);
  const nextBase: GameState = {
    pieces: newPieces,
    reserves: newReserves,
    turn: winner ? state.turn : opponent,
    winner,
    moves: state.moves + 1,
    history: state.history ?? [],
  };

  let suffix = "";
  if (!winner) {
    if (isInCheck(nextBase, opponent)) {
      if (!hasAnyLegalAction(nextBase, opponent)) {
        nextBase.winner = piece.owner;
        suffix = "#";
      } else {
        suffix = "+";
      }
    }
  }

  const entry = formatMove(piece, from, to, arriving, captured) + suffix;
  return { ...nextBase, history: [...(state.history ?? []), entry] };

}

export function reservesOf(state: GameState, faction: Faction): PieceState[] {
  return state.reserves?.[faction] ?? [];
}

// Free cells of one's own deployment zone, where captured pieces can be redeployed.
// A drop is only legal if it does not leave one's own king in check.
export function legalDrops(state: GameState, faction: Faction, pieceState?: PieceState): Axial[] {
  if (state.winner) return [];
  if (state.turn !== faction) return [];
  const reserve = reservesOf(state, faction);
  if (reserve.length === 0) return [];
  const states = pieceState ? [pieceState] : Array.from(new Set(reserve));
  return allCells().filter((c) => {
    if (deploymentZone(c) !== faction || state.pieces[key(c)]) return false;
    return states.some((s) => !isInCheck(simulateDrop(state, faction, s, c), faction));
  });
}

export function applyDrop(
  state: GameState,
  faction: Faction,
  pieceState: PieceState,
  to: Axial,
): GameState | null {
  if (state.turn !== faction || state.winner) return null;
  const reserve = reservesOf(state, faction);
  const idx = reserve.indexOf(pieceState);
  if (idx === -1) return null;
  if (!legalDrops(state, faction, pieceState).some((c) => c.q === to.q && c.r === to.r)) return null;

  const newReserves: Record<Faction, PieceState[]> = {
    yellow: [...reservesOf(state, "yellow")],
    purple: [...reservesOf(state, "purple")],
  };
  newReserves[faction].splice(idx, 1);

  const newPieces: Record<string, Piece> = { ...state.pieces };
  newPieces[key(to)] = {
    id: `${faction}-drop-${state.moves}-${key(to)}`,
    owner: faction,
    pos: to,
    state: pieceState,
    kind: "pawn",
  };

  const opponent = otherFaction(faction);
  const nextBase: GameState = {
    pieces: newPieces,
    reserves: newReserves,
    turn: opponent,
    winner: null,
    moves: state.moves + 1,
    history: state.history ?? [],
  };
  let suffix = "";
  if (isInCheck(nextBase, opponent)) {
    if (!hasAnyLegalAction(nextBase, opponent)) {
      nextBase.winner = faction;
      suffix = "#";
    } else {
      suffix = "+";
    }
  }
  return { ...nextBase, history: [...(state.history ?? []), `${pieceState}*${cellName(to)}${suffix}`] };
}


export function piecesOf(state: GameState, faction: Faction): Piece[] {
  return Object.values(state.pieces).filter((p) => p.owner === faction);
}
