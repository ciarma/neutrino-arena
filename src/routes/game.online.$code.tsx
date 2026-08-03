import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { GameShell } from "@/components/GameShell";
import { HexBoard } from "@/components/HexBoard";
import { applyDrop, applyMove, initialState, type Faction, type GameState, type PieceState } from "@/lib/game";
import { ReserveTray } from "@/components/ReserveTray";
import { key, type Axial } from "@/lib/hex";
import { playMoveSound } from "@/lib/sound";
import { getOrCreatePlayerId } from "@/lib/player-id";
import PdfViewerModal from "@/components/PdfViewerModal";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/game/online/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Partita ${params.code} — Neutrino Arena` },
      { name: "description", content: `Partita online di Neutrino Arena, codice ${params.code}. Duello a due fazioni su plancia esagonale.` },
      { property: "og:title", content: `Partita ${params.code} — Neutrino Arena` },
      { property: "og:description", content: "Gioca a Neutrino Arena online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnlineGame,
});

type Row = {
  code: string;
  state: GameState;
  yellow_player: string | null;
  purple_player: string | null;
};

function OnlineGame() {
  const { code } = Route.useParams();
  const { t } = useI18n();
  const playerId = useMemo(() => getOrCreatePlayerId(), []);
  const [row, setRow] = useState<Row | null>(null);
  const [past, setPast] = useState<GameState[]>([]);
  const [selected, setSelected] = useState<Axial | null>(null);
  const [dropState, setDropState] = useState<PieceState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Initial fetch + auto-join as purple if empty.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("games")
        .select("code, state, yellow_player, purple_player")
        .eq("code", code)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setError(t("online.notFound"));
        return;
      }
      let current = data as Row;
      // Auto-assign purple if this player is not yellow and purple is empty.
      if (current.yellow_player !== playerId && !current.purple_player) {
        const { data: updated, error: upErr } = await supabase
          .from("games")
          .update({ purple_player: playerId })
          .eq("code", code)
          .is("purple_player", null)
          .select("code, state, yellow_player, purple_player")
          .maybeSingle();
        if (!upErr && updated) current = updated as Row;
      }
      setRow(current);
    })();
    return () => { cancelled = true; };
  }, [code, playerId]);

  // Realtime subscription.
  useEffect(() => {
    const channel = supabase
      .channel(`games:${code}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "games", filter: `code=eq.${code}` }, (payload) => {
        const incoming = payload.new as Row;
        setRow((prev) => {
          const before = prev?.state?.history?.length ?? 0;
          const after = incoming.state?.history?.length ?? 0;
          if (after > before) playMoveSound("move");
          return incoming;
        });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);

  const myFaction: Faction | null = row
    ? row.yellow_player === playerId
      ? "yellow"
      : row.purple_player === playerId
        ? "purple"
        : null
    : null;

  const state = row?.state ?? initialState();
  const disabled = !myFaction || state.turn !== myFaction || !!state.winner;

  const handleMove = async (from: Axial, to: Axial, chosen?: "M" | "T") => {
    if (!row || !myFaction) return;
    if (state.turn !== myFaction) return;
    const next = applyMove(state, from, to, chosen);
    if (!next) return;
    playMoveSound(state.pieces[key(to)] ? "capture" : "move");
    setSelected(null);
    setDropState(null);
    setPast((p) => [...p, state]);
    setRow({ ...row, state: next });
    const { error } = await supabase
      .from("games")
      .update({ state: next as never, updated_at: new Date().toISOString() })
      .eq("code", code);
    if (error) setError(error.message);
  };

  const handleDrop = async (to: Axial) => {
    if (!row || !myFaction || !dropState) return;
    const next = applyDrop(state, myFaction, dropState, to);
    if (!next) return;
    playMoveSound("move");
    setSelected(null);
    setDropState(null);
    setPast((p) => [...p, state]);
    setRow({ ...row, state: next });
    const { error } = await supabase
      .from("games")
      .update({ state: next as never, updated_at: new Date().toISOString() })
      .eq("code", code);
    if (error) setError(error.message);
  };

  const undo = async () => {
    if (!row || past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setSelected(null);
    setDropState(null);
    setRow({ ...row, state: prev });
    const { error } = await supabase
      .from("games")
      .update({ state: prev as never, updated_at: new Date().toISOString() })
      .eq("code", code);
    if (error) setError(error.message);
  };

  const reset = async () => {
    if (!row) return;
    const fresh = initialState();
    setPast([]);
    setRow({ ...row, state: fresh });
    setSelected(null);
    await supabase.from("games").update({ state: fresh as never }).eq("code", code);
  };


  const shareCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-destructive">{error}</p>
          <Link to="/game/online" className="mt-4 inline-block text-sm underline">{t("online.backToLobby")}</Link>
        </div>
      </div>
    );
  }

  const bottomFaction: Faction = myFaction === "purple" ? "purple" : "yellow";
  const topFaction: Faction = bottomFaction === "yellow" ? "purple" : "yellow";

  const waiting = row && !row.purple_player;
  const status = waiting
    ? t("online.waiting")
    : !myFaction
      ? t("online.full")
      : state.winner
        ? state.winner === myFaction ? t("online.won") : t("online.lost")
        : state.turn === myFaction
          ? t("online.yourTurn")
          : t("online.waitOpponent");

  return (
    <GameShell
      title={t("online.game", { code })}
      subtitle={myFaction ? t("online.youAre", { faction: myFaction === "yellow" ? t("faction.yellowShort") : t("faction.purpleShort") }) : t("online.spectator")}
      state={state}
      perspective={myFaction ?? "yellow"}
      status={status}
      actions={
        <div className="flex items-center gap-3">
	<PdfViewerModal />
          <button
            onClick={shareCode}
            className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-accent transition"
          >
            {copied ? t("online.copied") : t("online.copyCode", { code })}
          </button>
          {myFaction && (
            <button
              onClick={undo}
              disabled={past.length === 0}
              className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-accent transition disabled:opacity-40 disabled:pointer-events-none"
            >
              {t("common.undo")}
            </button>
          )}
          {state.winner && myFaction && (
            <button
              onClick={reset}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
            >
              {t("common.replay")}
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-3">
        {([topFaction, bottomFaction] as const).map((f, i) => (
          <div key={f} className="space-y-3">
            {i === 1 && (
              <HexBoard
                state={state}
                selected={selected}
                onSelect={setSelected}
                onMove={handleMove}
                perspective={myFaction ?? "yellow"}
                disabled={disabled}
                dropState={dropState}
                onDrop={handleDrop}
              />
            )}
            <ReserveTray
              state={state}
              faction={f}
              label={myFaction === f ? t("reserve.yours") : undefined}
              selected={myFaction === f ? dropState : undefined}
              onSelect={myFaction === f ? (s: PieceState | null) => { setDropState(s); setSelected(null); } : undefined}
              interactive={myFaction === f}
            />
          </div>
        ))}
      </div>
    </GameShell>
  );
}
