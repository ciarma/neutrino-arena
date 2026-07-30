import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { Faction, GameState } from "@/lib/game";
import { isInCheck, piecesOf } from "@/lib/game";

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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-serif text-lg tracking-tight text-foreground hover:text-primary transition">
            ← Neutrino Arena
          </Link>
          <div className="text-right">
            <h1 className="font-serif text-xl leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {!state.winner && isInCheck(state, state.turn) && (
          <div className="mb-4 rounded-2xl border-2 border-destructive/70 bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive">
            SCACCO al Re {state.turn === "yellow" ? "Neutrini" : "Anti-Neutrini"} — devi risolvere lo scacco con questa mossa.
          </div>
        )}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <FactionBadge faction="yellow" count={yellow} active={state.turn === "yellow" && !state.winner} perspective={perspective} />
          <div className="text-center text-sm text-muted-foreground">
            {status ?? (
              <>
                {state.winner ? (
                  <span className="font-medium text-foreground">
                    Vittoria {state.winner === "yellow" ? "Neutrini" : "Anti-Neutrini"}
                  </span>
                ) : (
                  <span>Turno {state.turn === "yellow" ? "Neutrini" : "Anti-Neutrini"} · mossa #{state.moves + 1}</span>
                )}
              </>
            )}
          </div>
          <FactionBadge faction="purple" count={purple} active={state.turn === "purple" && !state.winner} perspective={perspective} />
        </div>


        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="rounded-3xl border border-border/60 bg-card/40 p-4 shadow-inner">{children}</div>
          <MoveLog
            history={state.history ?? []}
            first={
              state.first ??
              // Fallback for states created before `first` existed: infer it from
              // whose turn it is and how many half-moves were played.
              ((state.history ?? []).length % 2 === 0
                ? state.turn
                : state.turn === "yellow"
                  ? "purple"
                  : "yellow")
            }
          />
        </div>

        {actions && <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
      </main>
    </div>
  );
}

function MoveLog({ history, first = "yellow" }: { history: string[]; first?: Faction }) {
  const rows: Array<{ n: number; y?: string; p?: string }> = [];
  // If purple moved first, shift the log by one half-move so columns stay aligned.
  const entries: Array<string | undefined> = first === "purple" ? [undefined, ...history] : [...history];
  for (let i = 0; i < entries.length; i += 2) {
    rows.push({ n: i / 2 + 1, y: entries[i], p: entries[i + 1] });
  }
  return (
    <aside className="rounded-3xl border border-border/60 bg-card/40 p-4 shadow-inner lg:sticky lg:top-4 lg:max-h-[70vh] lg:overflow-auto">
      <h2 className="mb-3 font-serif text-sm uppercase tracking-[0.2em] text-muted-foreground">
        Registro mosse
      </h2>
      {history.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nessuna mossa ancora.</p>
      ) : (
        <ol className="space-y-1 font-mono text-xs">
          {rows.map((row) => (
            <li key={row.n} className="grid grid-cols-[1.75rem_1fr_1fr] items-baseline gap-2">
              <span className="tabular-nums text-muted-foreground">{row.n}.</span>
              <span className="text-[color:var(--faction-yellow)]" style={{ filter: "brightness(0.75) saturate(1.4)" }}>
                {row.y ?? ""}
              </span>
              <span className="text-[color:var(--faction-purple)]">{row.p ?? ""}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
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
        {faction === "yellow" ? "Neutrini" : "Anti-Neutrini"}
        {isYou && <span className="ml-1 text-xs text-muted-foreground">(tu)</span>}
      </span>
      <span className="tabular-nums text-muted-foreground">{count} pezzi</span>
    </div>
  );
}
