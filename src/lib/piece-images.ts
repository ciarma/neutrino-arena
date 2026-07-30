// Immagini delle pedine (template): sostituisci i PNG in src/assets/pieces/
// mantenendo gli stessi nomi file, oppure cambia gli import qui sotto.
import yellowPawnE from "@/assets/pieces/yellow-pawn-E.png";
import yellowPawnM from "@/assets/pieces/yellow-pawn-M.png";
import yellowPawnT from "@/assets/pieces/yellow-pawn-T.png";
import yellowKingE from "@/assets/pieces/yellow-king-E.png";
import yellowKingM from "@/assets/pieces/yellow-king-M.png";
import yellowKingT from "@/assets/pieces/yellow-king-T.png";
import purplePawnE from "@/assets/pieces/purple-pawn-E.png";
import purplePawnM from "@/assets/pieces/purple-pawn-M.png";
import purplePawnT from "@/assets/pieces/purple-pawn-T.png";
import purpleKingE from "@/assets/pieces/purple-king-E.png";
import purpleKingM from "@/assets/pieces/purple-king-M.png";
import purpleKingT from "@/assets/pieces/purple-king-T.png";

import type { Faction, PieceKind, PieceState } from "@/lib/game";

export const pieceImages: Record<Faction, Record<PieceKind, Record<PieceState, string>>> = {
  yellow: {
    pawn: { E: yellowPawnE, M: yellowPawnM, T: yellowPawnT },
    king: { E: yellowKingE, M: yellowKingM, T: yellowKingT },
  },
  purple: {
    pawn: { E: purplePawnE, M: purplePawnM, T: purplePawnT },
    king: { E: purpleKingE, M: purpleKingM, T: purpleKingT },
  },
};

export function pieceImage(owner: Faction, kind: PieceKind, state: PieceState): string {
  return pieceImages[owner][kind][state];
}
