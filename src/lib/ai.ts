import { applyMove, legalMoves, otherFaction, piecesOf, type Faction, type GameState } from "./game";
import { BOARD_SIZE, type Axial } from "./hex";

type Move = { from: Axial; to: Axial };

function allMoves(state: GameState, faction: Faction): Move[] {
  const moves: Move[] = [];
  for (const piece of piecesOf(state, faction)) {
    if (piece.owner !== state.turn) continue;
    for (const to of legalMoves(state, piece.pos)) {
      moves.push({ from: piece.pos, to });
    }
  }
  return moves;
}

function evaluate(state: GameState, ai: Faction): number {
  if (state.winner === ai) return 10000;
  if (state.winner && state.winner !== ai) return -10000;
  const mine = piecesOf(state, ai).length;
  const theirs = piecesOf(state, otherFaction(ai)).length;
  // Positional bonus: prefer advancing toward opponent's side.
  let advance = 0;
  const target = ai === "yellow" ? BOARD_SIZE - 1 : 0;
  for (const p of piecesOf(state, ai)) {
    advance += (BOARD_SIZE - 1 - Math.abs(p.pos.r - target)) * 0.1;
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
      const next = applyMove(state, m.from, m.to);
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
      const next = applyMove(state, m.from, m.to);
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
    const next = applyMove(state, m.from, m.to);
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
