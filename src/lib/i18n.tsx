import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "it" | "en";

const STORAGE_KEY = "neutrino-arena-lang";

const it = {
  "nav.back": "← Neutrino Arena",
  "nav.home": "← Home",
  "faction.yellow": "Neutrini",
  "faction.purple": "Anti-Neutrini",
  "faction.yellowShort": "giallo",
  "faction.purpleShort": "viola",
  "shell.check":
    "SCACCO al Re {faction} !",
  "shell.win": "Vittoria {faction}",
  "shell.turn": "Turno {faction} · mossa #{n}",
  "shell.moveLog": "Registro mosse",
  "shell.noMoves": "Nessuna mossa ancora.",
  "shell.pieces": "{n} pezzi",
  "shell.you": "(tu)",
  "sound.on": "Suono attivo",
  "sound.off": "Suono disattivato",
  "sound.enable": "Attiva suono",
  "sound.disable": "Disattiva suono",
  "board.aria": "Plancia esagonale",
  "board.chooseState":
    "Scegli lo stato di arrivo della pedina",
  "common.cancel": "Annulla",
  "common.undo": "Annulla",
  "common.newGame": "Nuova partita",
  "common.replay": "Rigioca",
  "reserve.of": "Riserva {faction}",
  "reserve.yours": "La tua riserva",
  "reserve.empty": "vuota",
  "reserve.hint":
    "Schiera questa pedina in una cella libera del tuo schieramento",
  "reserve.alt": "Pedina {faction} stato {state}",
  "rules.open": "Apri il regolamento",
  "rules.title": "Regolamento",
  "rules.close": "Chiudi il regolamento",
  "rules.download": "Scarica PDF",
  "home.kicker": "INFN GAME",
  "home.h1a": "Una sfida tra",
  "home.h1b": "e",
  "home.h1c": "basata sul fenomeno dell'Oscillazione.",
  "home.intro":
    "I neutrini attraversano l’universo cambiando identità: in questo gioco fanno lo stesso sul tabellone. Neutrino Arena è un gioco da tavolo astratto che introduce il fenomeno dell’oscillazione dei neutrini attraverso meccaniche dinamiche. Strategia, intuizione e sorpresa si combinano in un’esperienza unica e coinvolgente alla scoperta di cosa sono i neutrini e perché sono così importanti.",
  "home.local": "Locale",
  "home.localDesc": "Due giocatori sullo stesso dispositivo, turno dopo turno.",
  "home.ai": "Contro l'IA",
  "home.aiDesc": "Sfida un avversario controllato dal computer.",
  "home.online": "Online",
  "home.onlineDesc": "Crea una partita e condividi il codice con un amico.",
  "home.play": "Gioca →",
  "home.howTo": "Come si gioca",
  "home.wip": "In sviluppo",
  "home.author": "Autore: Andrea Ciarma. Progetto INFN GAME ",
  "home.site": "Sito Web del Progetto",
  "local.title": "Partita locale",
  "local.subtitle": "Due giocatori, stesso dispositivo",
  "ai.title": "Contro l'IA",
  "ai.chooseDifficulty": "Scegli la difficoltà prima di iniziare.",
  "ai.easy": "Facile",
  "ai.easyDesc": "L'IA commette spesso mosse non ottimali.",
  "ai.hard": "Difficile",
  "ai.hardDesc": "L'IA cerca sempre la mossa migliore.",
  "ai.changeDifficulty": "Cambia difficoltà",
  "ai.subtitle": "Sei il giallo · difficoltà {difficulty}",
  "ai.won": "Hai vinto!",
  "ai.lost": "Ha vinto l'IA",
  "ai.thinking": "L'IA sta pensando…",
  "ai.yourTurn": "Tocca a te (giallo)",
  "online.title": "Partita online",
  "online.lead":
    "Crea una nuova partita e condividi il codice, oppure inserisci il codice ricevuto.",
  "online.create": "Crea partita",
  "online.createDesc": "Sarai la fazione gialla. Ti daremo un codice da condividere.",
  "online.join": "Unisciti",
  "online.joinDesc": "Inserisci il codice ricevuto per unirti come fazione viola.",
  "online.invalidCode": "Codice non valido",
  "online.notFound": "Partita non trovata",
  "online.backToLobby": "Torna alla lobby",
  "online.game": "Partita {code}",
  "online.youAre": "Sei {faction}",
  "online.spectator": "Spettatore",
  "online.waiting": "In attesa del secondo giocatore…",
  "online.full": "La partita è al completo — sei spettatore",
  "online.won": "Hai vinto!",
  "online.lost": "Hai perso",
  "online.yourTurn": "Tocca a te",
  "online.waitOpponent": "Attendi l'avversario",
  "online.copied": "Codice copiato!",
  "online.copyCode": "Copia codice {code}",
} as const;

type Dict = Record<keyof typeof it, string>;

const en: Dict = {
  "nav.back": "← Neutrino Arena",
  "nav.home": "← Home",
  "faction.yellow": "Neutrinos",
  "faction.purple": "Anti-Neutrinos",
  "faction.yellowShort": "yellow",
  "faction.purpleShort": "purple",
  "shell.check": "CHECK on the {faction} King !",
  "shell.win": "{faction} win",
  "shell.turn": "{faction}'s turn · move #{n}",
  "shell.moveLog": "Move log",
  "shell.noMoves": "No moves yet.",
  "shell.pieces": "{n} pieces",
  "shell.you": "(you)",
  "sound.on": "Sound on",
  "sound.off": "Sound off",
  "sound.enable": "Turn sound on",
  "sound.disable": "Turn sound off",
  "board.aria": "Hexagonal board",
  "board.chooseState": "Choose the arrival flavour of the piece",
  "common.cancel": "Cancel",
  "common.undo": "Undo",
  "common.newGame": "New game",
  "common.replay": "Play again",
  "reserve.of": "{faction} reserve",
  "reserve.yours": "Your reserve",
  "reserve.empty": "empty",
  "reserve.hint": "Deploy this piece on a free cell of your deployment zone",
  "reserve.alt": "{faction} piece, flavour {state}",
  "rules.open": "Open the rulebook",
  "rules.title": "Rulebook",
  "rules.close": "Close the rulebook",
  "rules.download": "Download PDF",
  "home.kicker": "INFN GAME",
  "home.h1a": "A duel between",
  "home.h1b": "and",
  "home.h1c": "based on the Oscillation phenomenon.",
  "home.intro":
    "Neutrinos travel across the universe changing identity: in this game they do the same on the board. Neutrino Arena is an abstract board game that introduces neutrino oscillation through dynamic mechanics. Strategy, intuition and surprise combine into a unique, engaging experience that reveals what neutrinos are and why they matter so much.",
  "home.local": "Local",
  "home.localDesc": "Two players on the same device, turn after turn.",
  "home.ai": "Vs AI",
  "home.aiDesc": "Challenge a computer-controlled opponent.",
  "home.online": "Online",
  "home.onlineDesc": "Create a game and share the code with a friend.",
  "home.play": "Play →",
  "home.howTo": "How to play",
  "home.wip": "In development",
  "home.author": "Author: Andrea Ciarma. INFN GAME project ",
  "home.site": "Project website",
  "local.title": "Local game",
  "local.subtitle": "Two players, same device",
  "ai.title": "Vs AI",
  "ai.chooseDifficulty": "Choose the difficulty before starting.",
  "ai.easy": "Easy",
  "ai.easyDesc": "The AI often plays sub-optimal moves.",
  "ai.hard": "Hard",
  "ai.hardDesc": "The AI always looks for the best move.",
  "ai.changeDifficulty": "Change difficulty",
  "ai.subtitle": "You are yellow · {difficulty} difficulty",
  "ai.won": "You won!",
  "ai.lost": "The AI won",
  "ai.thinking": "The AI is thinking…",
  "ai.yourTurn": "Your turn (yellow)",
  "online.title": "Online game",
  "online.lead": "Create a new game and share the code, or enter a code you received.",
  "online.create": "Create game",
  "online.createDesc": "You will play yellow. We'll give you a code to share.",
  "online.join": "Join",
  "online.joinDesc": "Enter the code you received to join as the purple faction.",
  "online.invalidCode": "Invalid code",
  "online.notFound": "Game not found",
  "online.backToLobby": "Back to the lobby",
  "online.game": "Game {code}",
  "online.youAre": "You are {faction}",
  "online.spectator": "Spectator",
  "online.waiting": "Waiting for the second player…",
  "online.full": "This game is full — you are a spectator",
  "online.won": "You won!",
  "online.lost": "You lost",
  "online.yourTurn": "Your turn",
  "online.waitOpponent": "Waiting for your opponent",
  "online.copied": "Code copied!",
  "online.copyCode": "Copy code {code}",
};

const dictionaries: Record<Lang, Dict> = { it: it as unknown as Dict, en };

export type TKey = keyof typeof it;
export type TFunc = (key: TKey, vars?: Record<string, string | number>) => string;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: TFunc };

const I18nContext = createContext<Ctx>({
  lang: "it",
  setLang: () => {},
  t: (key) => dictionaries.it[key] ?? key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  // Default to Italian on the server so hydration matches; read the stored
  // preference after mount.
  const [lang, setLangState] = useState<Lang>("it");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "it") setLangState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  const t: TFunc = (key, vars) => {
    let out = dictionaries[lang][key] ?? dictionaries.it[key] ?? String(key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        out = out.replaceAll(`{${k}}`, String(v));
      }
    }
    return out;
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function getRulesPdfPath(lang: Lang): string {
  return lang === "en"
    ? "/NeutrinoChess_rulebook_english_1v2_compressed.pdf"
    : "/NeutrinoChess_rulebook_fisico_1v2_compressed.pdf";
}
