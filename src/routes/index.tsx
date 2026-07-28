import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Neutrino Arena" },
      { name: "description", content: "Un gioco da tavolo astratto su plancia esagonale a rombo. Giallo contro Viola: muovi, cattura, conquista. Locale, contro l'IA o online con un codice partita." },
      { property: "og:title", content: "Neutrino Arena" },
      { property: "og:description", content: "Giallo contro Viola su una plancia esagonale a rombo. Gioca in locale, contro l'IA, o online con un codice partita." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif text-lg tracking-wide">
            <span className="inline-block h-3 w-3 rounded-full bg-[color:var(--faction-yellow)]" />
            <span>Neutrino Arena</span>
            <span className="inline-block h-3 w-3 rounded-full bg-[color:var(--faction-purple)]" />
          </div>
        </header>

        <section className="mb-16 max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            INFN GAME
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Una sfida tra{" "}
            <span className="italic text-[color:var(--faction-yellow)]" style={{ textShadow: "0 1px 0 oklch(0.45 0.12 80)" }}>
              Neutrini
            </span>{" "}
            e{" "}
            <span className="italic text-[color:var(--faction-purple)]">Anti-Neutrini</span>
            {" "}
            basata sul fenomeno dell'Oscillazione.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            I neutrini attraversano l’universo cambiando identità: in questo gioco fanno lo stesso sul tabellone. Neutrino Arena è un gioco da tavolo astratto che introduce il fenomeno dell’oscillazione dei neutrini attraverso meccaniche dinamiche. Strategia, intuizione e sorpresa si combinano in un’esperienza unica e coinvolgente alla scoperta di cosa sono i neutrini e perché sono così importanti.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <ModeCard
            title="Locale"
            desc="Due giocatori sullo stesso dispositivo, turno dopo turno."
            to="/game/local"
            accent="yellow"
          />
          <ModeCard
            title="Contro l'IA"
            desc="Sfida un avversario controllato dal computer."
            to="/game/ai"
            accent="mixed"
          />
          <ModeCard
            title="Online"
            desc="Crea una partita e condividi il codice con un amico."
            to="/game/online"
            accent="purple"
          />
        </section>

        <section className="mt-16 grid gap-6 rounded-3xl border border-border/60 bg-card/70 p-8 backdrop-blur sm:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl">Come si gioca</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
	      <li>Un giocatore controlla i <span className="italic text-[color:var(--faction-yellow)]">Neutrini</span>, l'altro gli <span className="italic text-[color:var(--faction-purple)]">Anti-Neutrini</span>. I neutrini esistono in 3 diversi tipi, o <b>Sapori</b>:  <span className="italic text-[color:blue]">Elettronico</span>, <span className="italic text-[color:green]">Muonico</span> e <span className="italic text-[color:red]">Tauonico</span>.</li>

	      <li>Ogni giocatore ha 5 Pezzi Neutrino e 1 Pezzo Re Neutrino (♛).</li>
	      <li>· Vince chi da <b>scacco matto al Re Neutrino avversario</b> oppure chi <b>cattura tutti gli altri Pezzi Neutrino</b>.</li>

	      <li>Neutrino Chess è un <b>gioco a turni</b>. Cominciando dal Primo Giocatore, ogni Giocatore può fare una delle seguenti <b>Azioni</b>: <b>Muovere</b> oppure <b>Schierare un Pezzo Catturato</b>.</li>

              <li><b>Muovere - </b>Muovi un Pezzo di 1 o 2 celle in linea retta (possono scavalcarsi). A causa del fenomeno dell’Oscillazione, il tuo Pezzo Neutrino <b>cambierà Sapore</b> a seconda della distanza percorsa.</li>
	      <li>· La plancia è divisa in una Zona di Battaglia (al centro) e due Zone di Schieramento (da dove partono le due squadre). Dalla Zona di Schieramento puoi muovere solo <u>in avanti</u> verso la Zona di Battaglia. Dalla Zona di Battaglia <u>non si puo mai entrare</u> in una Zona di Schieramento.</li>
	      <li>· Per <b>catturare</b> un pezzo avversario finisci il tuo movimento su di esso con il suo stesso Sapore.</li>
	      
            </ul>
          </div>
          <div className="rounded-2xl border border-border/40 bg-background/60 p-6">
            <p className="font-serif text-xl">In sviluppo</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Versione ancora in sviluppo. Mancano immagini e grafica, magari mettere il regolamento vero dal PDF, e alcune regole non sono ancora programmate bene. Poi aggiungere qui rimandi al sito INFN per approfondimenti.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function ModeCard({
  title,
  desc,
  to,
  accent,
}: {
  title: string;
  desc: string;
  to: string;
  accent: "yellow" | "purple" | "mixed";
}) {
  const gradient =
    accent === "yellow"
      ? "linear-gradient(135deg, oklch(0.95 0.12 95), oklch(0.75 0.16 85))"
      : accent === "purple"
        ? "linear-gradient(135deg, oklch(0.6 0.22 305), oklch(0.32 0.18 295))"
        : "linear-gradient(135deg, oklch(0.85 0.15 90), oklch(0.45 0.22 300))";
  const fg = accent === "purple" ? "oklch(0.98 0.01 90)" : "oklch(0.22 0.04 300)";
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-border/50 p-6 transition hover:-translate-y-1 hover:shadow-xl"
      style={{ background: gradient, color: fg }}
    >
      <p className="font-serif text-2xl">{title}</p>
      <p className="mt-2 text-sm opacity-90">{desc}</p>
      <p className="mt-6 text-sm font-medium opacity-80 group-hover:opacity-100">Gioca →</p>
    </Link>
  );
}
