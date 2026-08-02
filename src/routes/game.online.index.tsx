import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { initialState } from "@/lib/game";
import { getOrCreatePlayerId } from "@/lib/player-id";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export const Route = createFileRoute("/game/online/")({
  head: () => ({
    meta: [
      { title: "Partita online — Neutrino Arena" },
      { name: "description", content: "Crea una partita di Neutrino Arena online e condividi il codice, oppure inserisci il codice per unirti a un amico." },
      { property: "og:title", content: "Partita online — Neutrino Arena" },
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
  const { t } = useI18n();
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
      setError(t("online.invalidCode"));
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.from("games").select("code").eq("code", code).maybeSingle();
    if (error || !data) {
      setError(t("online.notFound"));
      setBusy(false);
      return;
    }
    navigate({ to: "/game/online/$code", params: { code } });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">{t("nav.home")}</Link>
          <LanguageToggle />
        </div>

        <h1 className="mt-6 font-serif text-4xl">{t("online.title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("online.lead")}
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur">
            <h2 className="font-serif text-2xl">{t("online.create")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("online.createDesc")}
            </p>
            <button
              onClick={createGame}
              disabled={busy}
              className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "…" : t("online.create")}
            </button>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur">
            <h2 className="font-serif text-2xl">{t("online.join")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("online.joinDesc")}
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
              {busy ? "…" : t("online.join")}
            </button>
          </div>
        </div>

        {error && <p className="mt-6 text-center text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
