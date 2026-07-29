import { applyDrop, applyMove, legalDrops, legalMoves, legalStateChoices, otherFaction, piecesOf, reservesOf, type Faction, type GameState, type PieceState } from "./game";
import { BOARD_SIZE, type Axial } from "./hex";

export type Move =
  | { kind?: "move"; from: Axial; to: Axial; chosen?: "M" | "T" }
  | { kind: "drop"; drop: PieceState; to: Axial };

export function applyAiMove(state: GameState, faction: Faction, m: Move): GameState | null {
  if ("kind" in m && m.kind === "drop") return applyDrop(state, faction, m.drop, m.to);
  const mm = m as { from: Axial; to: Axial; chosen?: "M" | "T" };
  return applyMove(state, mm.from, mm.to, mm.chosen);
}

function allMoves(state: GameState, faction: Faction): Move[] {
  const moves: Move[] = [];
  for (const piece of piecesOf(state, faction)) {
    if (piece.owner !== state.turn) continue;
    for (const to of legalMoves(state, piece.pos)) {
      const choices = legalStateChoices(state, piece.pos, to);
      // For E + 2 steps on an empty cell there are two possible resulting
      // states; enumerate both so the AI can pick.
      if (piece.state === "E" && (Math.abs(to.q - piece.pos.q) + Math.abs(to.r - piece.pos.r) + Math.abs((to.q - piece.pos.q) + (to.r - piece.pos.r))) / 2 === 2) {
        for (const c of choices) {
          if (c === "M" || c === "T") moves.push({ from: piece.pos, to, chosen: c });
        }
      } else {
        moves.push({ from: piece.pos, to });
      }
    }
  }
  const drops = legalDrops(state, faction);
  const uniqueReserve = Array.from(new Set(reservesOf(state, faction)));
  for (const d of uniqueReserve) {
    for (const to of drops) moves.push({ kind: "drop", drop: d, to });
  }
  return moves;
}

function evaluate(state: GameState, ai: Faction): number {
  if (state.winner === ai) return 10000;
  if (state.winner && state.winner !== ai) return -10000;
  const mine = piecesOf(state, ai).length;
  const theirs = piecesOf(state, otherFaction(ai)).length;
  const maxRow = (BOARD_SIZE - 1) * 2;
  let advance = 0;
  for (const p of piecesOf(state, ai)) {
    const row = p.pos.q + p.pos.r;
    advance += (ai === "yellow" ? row : maxRow - row) * 0.1;
  }
  return (mine - theirs) * 10 + advance;
}

function minimax(state: GameState, depth: number, ai: Faction, alpha: number, beta: number): number {
  if (depth === 0 || state.winner) return evaluate(state, ai);
  const isMax = state.turn === ai;
  const moves = allMoves(state, state.turn);
  if (moves.length === 0) return evaluate(state, ai);
  if (isMax) {
    let best = -Infinity;
    for (const m of moves) {
      const next = applyAiMove(state, state.turn, m);
      if (!next) continue;
      const score = minimax(next, depth - 1, ai, alpha, beta);
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const next = applyAiMove(state, state.turn, m);
      if (!next) continue;
      const score = minimax(next, depth - 1, ai, alpha, beta);
      best = Math.min(best, score);
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function chooseAiMove(state: GameState, ai: Faction, depth = 2): Move | null {
  const moves = allMoves(state, ai);
  if (moves.length === 0) return null;
  let bestScore = -Infinity;
  let best: Move[] = [];
  for (const m of moves) {
    const next = applyAiMove(state, ai, m);
    if (!next) continue;
    const score = minimax(next, depth - 1, ai, -Infinity, Infinity) + Math.random() * 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = [m];
    } else if (score === bestScore) {
      best.push(m);
    }
  }
  return best[Math.floor(Math.random() * best.length)] ?? null;
}
