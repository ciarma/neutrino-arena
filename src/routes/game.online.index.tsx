import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { initialState } from "@/lib/game";
import { getOrCreatePlayerId } from "@/lib/player-id";

export const Route = createFileRoute("/game/online/")({
  head: () => ({
    meta: [
      { title: "Partita online — Rombo" },
      { name: "description", content: "Crea una partita di Rombo online e condividi il codice, oppure inserisci il codice per unirti a un amico." },
      { property: "og:title", content: "Partita online — Rombo" },
      { property: "og:description", content: "Multiplayer con codice partita: crea o inserisci il codice per iniziare." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnlineLobby,
});

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function OnlineLobby() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGame = async () => {
    setBusy(true);
    setError(null);
    const playerId = getOrCreatePlayerId();
    const code = randomCode();
    const { error } = await supabase.from("games").insert({
      code,
      state: initialState() as never,
      yellow_player: playerId,
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    navigate({ to: "/game/online/$code", params: { code } });
  };

  const joinGame = async () => {
    setError(null);
    const code = joinCode.trim().toUpperCase();
    if (code.length < 3) {
      setError("Codice non valido");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.from("games").select("code").eq("code", code).maybeSingle();
    if (error || !data) {
      setError("Partita non trovata");
      setBusy(false);
      return;
    }
    navigate({ to: "/game/online/$code", params: { code } });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>

        <h1 className="mt-6 font-serif text-4xl">Partita online</h1>
        <p className="mt-2 text-muted-foreground">
          Crea una nuova partita e condividi il codice, oppure inserisci il codice ricevuto.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur">
            <h2 className="font-serif text-2xl">Crea partita</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sarai la fazione gialla. Ti daremo un codice da condividere.
            </p>
            <button
              onClick={createGame}
              disabled={busy}
              className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "…" : "Crea partita"}
            </button>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur">
            <h2 className="font-serif text-2xl">Unisciti</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Inserisci il codice ricevuto per unirti come fazione viola.
            </p>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABC12"
              maxLength={8}
              className="mt-4 w-full rounded-full border border-border bg-background px-5 py-3 text-center font-mono text-lg tracking-[0.4em] uppercase focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={joinGame}
              disabled={busy || !joinCode.trim()}
              className="mt-4 w-full rounded-full border border-border bg-card px-5 py-3 text-sm font-medium transition hover:bg-accent disabled:opacity-50"
            >
              {busy ? "…" : "Unisciti"}
            </button>
          </div>
        </div>

        {error && <p className="mt-6 text-center text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
