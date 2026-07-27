import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { Faction, GameState } from "@/lib/game";
import { piecesOf } from "@/lib/game";

type Props = {
  title: string;
  subtitle?: string;
  state: GameState;
  perspective?: Faction;
  status?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
};

export function GameShell({ title, subtitle, state, perspective, status, children, actions }: Props) {
  const yellow = piecesOf(state, "yellow").length;
  const purple = piecesOf(state, "purple").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-serif text-lg tracking-tight text-foreground hover:text-primary transition">
            ← Rombo
          </Link>
          <div className="text-right">
            <h1 className="font-serif text-xl leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <FactionBadge faction="yellow" count={yellow} active={state.turn === "yellow" && !state.winner} perspective={perspective} />
          <div className="text-center text-sm text-muted-foreground">
            {status ?? (
              <>
                {state.winner ? (
                  <span className="font-medium text-foreground">
                    Vittoria {state.winner === "yellow" ? "gialla" : "viola"}
                  </span>
                ) : (
                  <span>Turno {state.turn === "yellow" ? "giallo" : "viola"} · mossa #{state.moves + 1}</span>
                )}
              </>
            )}
          </div>
          <FactionBadge faction="purple" count={purple} active={state.turn === "purple" && !state.winner} perspective={perspective} />
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/40 p-4 shadow-inner">{children}</div>

        {actions && <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
      </main>
    </div>
  );
}

function FactionBadge({
  faction,
  count,
  active,
  perspective,
}: {
  faction: Faction;
  count: number;
  active: boolean;
  perspective?: Faction;
}) {
  const isYou = perspective === faction;
  return (
    <div
      className={`flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition ${
        active
          ? faction === "yellow"
            ? "border-[color:var(--faction-yellow)] bg-[color:var(--faction-yellow)]/15"
            : "border-[color:var(--faction-purple)] bg-[color:var(--faction-purple)]/15"
          : "border-border/60 bg-background/40 opacity-70"
      }`}
    >
      <span
        className="inline-block h-4 w-4 rounded-full"
        style={{
          background:
            faction === "yellow"
              ? "radial-gradient(circle at 30% 30%, oklch(0.95 0.15 95), oklch(0.65 0.16 85))"
              : "radial-gradient(circle at 30% 30%, oklch(0.72 0.18 310), oklch(0.32 0.18 295))",
        }}
      />
      <span className="font-medium capitalize">
        {faction === "yellow" ? "Giallo" : "Viola"}
        {isYou && <span className="ml-1 text-xs text-muted-foreground">(tu)</span>}
      </span>
      <span className="tabular-nums text-muted-foreground">{count} pezzi</span>
    </div>
  );
}
