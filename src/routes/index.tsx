import { createFileRoute, Link } from "@tanstack/react-router";
import PdfViewerModal from "@/components/PdfViewerModal";
import { getRulesPdfPath, useI18n } from "@/lib/i18n";
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
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <div className="overflow-hidden rounded-2xl">
          <img
            src="/banner.png"
            alt="Neutrino Arena"
            width={1600}
            height={512}
            className="block h-auto max-h-[220px] w-full object-cover"
            fetchPriority="high"
          />
        </div>
      </div>
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
              {t("faction.yellow")}
            </span>{" "}
            e{" "}
            <span className="italic text-[color:var(--faction-purple)]">{t("faction.purple")}</span>
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
  		href={getRulesPdfPath(lang)}
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
      <li>Quando un pezzo viene mosso, cambia di Sapore per il fenomeno dell'Oscillazione in base alla distanza percorsa.</li>
      <li>Catture e Scacchi dipendono dal Sapore del pezzo alla fine del movimento.</li>
      <li>· Vince chi da <b>Scacco Matto al Re Neutrino avversario</b> oppure chi <b>cattura tutti gli altri Pezzi Neutrino</b>.</li>
      </ul>
  );
}

function RulesEn() {
  return (
    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
      <li>One player controls the <span className="italic text-[color:var(--faction-yellow)]">Neutrinos</span>, the other the <span className="italic text-[color:var(--faction-purple)]">Anti-Neutrinos</span>. Neutrinos come in 3 types, or <b>Flavours</b>: <span className="italic text-[color:blue]">Electron</span>, <span className="italic text-[color:green]">Muon</span> and <span className="italic text-[color:red]">Tau</span>.</li>
      <li>Each player has 5 Neutrino Pieces and 1 Neutrino King (♛).</li>
      <li>When you move a piece, it changes Flavour due to the Oscillation process according to the traveled distance.</li>
      <li> Captures and Checks depend on the piece Flavour at the end of the movement.</li>
      <li>· You win by delivering <b>Checkmate to the opposing Neutrino King</b> or by <b>capturing all the other Neutrino Pieces</b>.</li>
      </ul>
  );
}
