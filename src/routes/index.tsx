import { createFileRoute, Link } from "@tanstack/react-router";
import PdfViewerModal from "@/components/PdfViewerModal";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

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
  const { t, lang } = useI18n();
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif text-lg tracking-wide">
            <span className="inline-block h-3 w-3 rounded-full bg-[color:var(--faction-yellow)]" />
            <span>Neutrino Arena</span>
            <span className="inline-block h-3 w-3 rounded-full bg-[color:var(--faction-purple)]" />
          </div>
          <LanguageToggle />
        </header>

        <section className="mb-16 max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t("home.kicker")}
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            {t("home.h1a")}{" "}
            <span className="italic text-[color:var(--faction-yellow)]" style={{ textShadow: "0 1px 0 oklch(0.45 0.12 80)" }}>
              Neutrini
            </span>{" "}
            e{" "}
            <span className="italic text-[color:var(--faction-purple)]">Anti-Neutrini</span>
            {" "}
            {t("home.h1c")}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            {t("home.intro")}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <ModeCard
            title={t("home.local")}
            desc={t("home.localDesc")}
            to="/game/local"
            accent="yellow"
          />
          <ModeCard
            title={t("home.ai")}
            desc={t("home.aiDesc")}
            to="/game/ai"
            accent="mixed"
          />
          <ModeCard
            title={t("home.online")}
            desc={t("home.onlineDesc")}
            to="/game/online"
            accent="purple"
          />
        </section>

        <section className="mt-16 grid gap-6 rounded-3xl border border-border/60 bg-card/70 p-8 backdrop-blur sm:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl">{t("home.howTo")}</h2>
            {lang === "it" ? <RulesIt /> : <RulesEn />}
          </div>
          <div className="rounded-2xl border border-border/40 bg-background/60 p-6">
            <p className="font-serif text-xl">{t("home.wip")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("home.author")}
			  <a href="https://web.infn.it/game/"
				target="_blank"
  				rel="noopener noreferrer"
  				className="text-blue-600 hover:underline font-semibold"
			  >{t("home.site")}</a>
	      
            </p>
	    <PdfViewerModal />
	    <a
  		href="/NeutrinoChess_rulebook_fisico_1v2_compressed.pdf"
  		download
  		className="text-sm font-medium hover:underline"
	    >
  {t("rules.download")}
</a>
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
  const { t } = useI18n();
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
      <p className="mt-6 text-sm font-medium opacity-80 group-hover:opacity-100">{t("home.play")}</p>
    </Link>
  );
}

function RulesIt() {
  return (
    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
      <li>Un giocatore controlla i <span className="italic text-[color:var(--faction-yellow)]">Neutrini</span>, l'altro gli <span className="italic text-[color:var(--faction-purple)]">Anti-Neutrini</span>. I neutrini esistono in 3 diversi tipi, o <b>Sapori</b>: <span className="italic text-[color:blue]">Elettronico</span>, <span className="italic text-[color:green]">Muonico</span> e <span className="italic text-[color:red]">Tauonico</span>.</li>
      <li>Ogni giocatore ha 5 Pezzi Neutrino e 1 Pezzo Re Neutrino (♛).</li>
      <li>· Vince chi da <b>Scacco Matto al Re Neutrino avversario</b> oppure chi <b>cattura tutti gli altri Pezzi Neutrino</b>.</li>
      <li>Neutrino Arena è un <b>gioco a turni</b>. Cominciando dal Primo Giocatore, ogni Giocatore può fare una delle seguenti <b>Azioni</b>: <b>Muovere</b> oppure <b>Schierare un Pezzo Catturato</b>.</li>
      <li><b>Muovere - </b>Muovi un Pezzo di 1 o 2 celle in linea retta (possono scavalcarsi). A causa del fenomeno dell’Oscillazione, il tuo Pezzo Neutrino <b>cambierà Sapore</b> a seconda della distanza percorsa.</li>
      <li>· Il tabellone è diviso in una Zona di Battaglia (al centro) e due Zone di Schieramento (da dove partono le due squadre). Dalla Zona di Schieramento puoi muovere solo <u>in avanti</u> verso la Zona di Battaglia. Dalla Zona di Battaglia <u>non si puo mai entrare</u> in una Zona di Schieramento.</li>
      <li>· Per <b>Catturare</b> un pezzo avversario finisci il tuo movimento su di esso con il suo stesso Sapore.</li>
      <li>· Se dopo una mossa un Re Neutrino potrebbe essere Catturato, si dice <b>Sotto Scacco</b> e deve essere mosso in un posto sicuro oppure rimossa la minaccia. <u>Attenzione: i Re Neutrino non possono Catturare i Pezzi Neutrino!</u> I Re Neutrino possono essere messi sotto scacco <b>anche quando si trovano nella Zona di Schieramento</b>. Se non c’è modo di salvare il Re allora si dice <b>Scacco Matto</b> e la partita finisce.</li>
      <li>· Muovere il proprio Re Neutrino in una cella nella quale sarebbe sotto scacco è una <b>mossa illegale</b>.</li>
      <li>· <u>I Re Neutrino possono “catturare” solo l’altro Re Neutrino.</u> Ciò significa che muovere il proprio Re Neutrino in una Cella dove potrebbe essere catturato dal Re Neutrino avversario è una <b>mossa illegale</b>.</li>
      <li><b>Schierare un Pezzo Catturato - </b>Metti un Pezzo che hai Catturato in una cella libera della tua Zona di Schieramento (diventa del tuo colore). Non puoi cambiare il Sapore del Pezzo prima di Schierarlo. Da adesso in poi trattalo come uno qualsiasi dei tuoi Pezzi.</li>
    </ul>
  );
}

function RulesEn() {
  return (
    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
      <li>One player controls the <span className="italic text-[color:var(--faction-yellow)]">Neutrinos</span>, the other the <span className="italic text-[color:var(--faction-purple)]">Anti-Neutrinos</span>. Neutrinos come in 3 types, or <b>Flavours</b>: <span className="italic text-[color:blue]">Electron</span>, <span className="italic text-[color:green]">Muon</span> and <span className="italic text-[color:red]">Tau</span>.</li>
      <li>Each player has 5 Neutrino Pieces and 1 Neutrino King (♛).</li>
      <li>· You win by delivering <b>Checkmate to the opposing Neutrino King</b> or by <b>capturing all the other Neutrino Pieces</b>.</li>
      <li>Neutrino Arena is a <b>turn-based game</b>. Starting from the First Player, each player may take one of these <b>Actions</b>: <b>Move</b> or <b>Deploy a Captured Piece</b>.</li>
      <li><b>Move - </b>Move a Piece 1 or 2 cells in a straight line (pieces may jump over each other). Because of Oscillation, your Neutrino Piece <b>changes Flavour</b> depending on the distance travelled.</li>
      <li>· The board is split into a Battle Zone (the centre) and two Deployment Zones (where each team starts). From your Deployment Zone you can only move <u>forward</u> towards the Battle Zone. From the Battle Zone you can <u>never enter</u> a Deployment Zone.</li>
      <li>· To <b>Capture</b> an enemy piece, end your movement on it with the same Flavour it has.</li>
      <li>· If after a move a Neutrino King could be Captured, it is <b>in Check</b> and must be moved to safety or the threat removed. <u>Careful: Neutrino Kings cannot Capture Neutrino Pieces!</u> Kings can be put in check <b>even inside a Deployment Zone</b>. If there is no way to save the King it is <b>Checkmate</b> and the game ends.</li>
      <li>· Moving your own Neutrino King into a cell where it would be in check is an <b>illegal move</b>.</li>
      <li>· <u>Neutrino Kings can only “capture” the other Neutrino King.</u> So moving your King to a cell where the enemy King could capture it is an <b>illegal move</b>.</li>
      <li><b>Deploy a Captured Piece - </b>Place a Piece you Captured on a free cell of your Deployment Zone (it becomes your colour). You cannot change its Flavour before deploying. From then on treat it like any of your own Pieces.</li>
    </ul>
  );
}
