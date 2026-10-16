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
  "shell.check": "SCACCO al Re {faction} !",
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
  "board.chooseState": "Scegli lo stato di arrivo della pedina",
  "common.cancel": "Annulla",
  "common.undo": "Annulla",
  "common.newGame": "Nuova partita",
  "common.replay": "Rigioca",
  "reserve.of": "Riserva {faction}",
  "reserve.yours": "La tua riserva",
  "reserve.empty": "vuota",
  "reserve.hint": "Schiera questa pedina in una cella libera del tuo schieramento",
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
  "footer.project": "INFN GAME",
  "footer.author": "Andrea Ciarma",
  "footer.version": "v0.1.0",
  "footer.placeholder": "",

  "local.title": "Partita locale",
  "local.subtitle": "Due giocatori, stesso dispositivo",
  "tutorial.title": "Tutorial",
  "tutorial.subtitle": "Impara a giocare passo dopo passo",
  "tutorial.placeholder": "Il tutorial è in preparazione: presto qui troverai una guida interattiva alle regole.",

  "tutorial.welcomeTitle": "Benvenuto al tutorial!",
  "tutorial.welcomeBody": "Qui imparerai passo dopo passo le regole di Neutrino Arena. Premi Continua per iniziare.",
  "tutorial.continue": "Continua",
  "tutorial.flavoursTitle": "I tre Sapori",
  "tutorial.flavoursBody": "Come i Neutrini, anche le nostre pedine esistono in 3 'Sapori': elettronico {e} muonico {m} e tauonico {t}.",
  "tutorial.oscillationTitle": "Oscillazione di Sapore",
  "tutorial.oscillationBody": "Quando i Neutrini viaggiano possono cambiare il loro Sapore, in un fenomeno che chiamiamo Oscillazione di Sapore.",
  "tutorial.piecesTitle": "Le nostre Pedine",
  "tutorial.piecesBody": "Anche le nostre Pedine possono cambiare di Sapore quando si muovono sul tabellone!",
  "tutorial.oneStepTitle": "Un solo passo",
  "tutorial.oneStepBody": "Se ci muoviamo di un solo passo, il neutrino elettronico rimane tale {ee}, il neutrino muonico diventa tauonico e viceversa {mt}. Prova a muovere le pedine di 1 passo!",
  "tutorial.twoStepTitle": "Due passi",
  "tutorial.twoStepBody": "Ottimo! Se invece ci muoviamo di due passi, il neutrino elettronico può diventare muonico o tauonico, mentre i neutrini muonici e tauonici diventano elettronici. Prova a muovere le pedine di 2 passi!",
  "tutorial.freeStepTitle": "Movimento Libero",
  "tutorial.freeStepBody": "Perfetto! Le pedine possono muoversi solo di 1 o 2 celle. Cliccando sulla pedina che vuoi muovere dei simboli ti mostreranno quali sono le mosse valide e con che sapore terminerai il movimento. Il movimento da 2 passi scavalca eventuali pedine nella casella centrale.",
  "tutorial.schier1Title": "Le zone di schieramento",
  "tutorial.schier1Body": "Alcune celle sul tabellone sono colorate di Giallo o di Viola. Queste sono dette Zone di Schieramento, e sono le celle in cui si trovano le pedine a inizio partita. Le celle bianche al centro invece formano il Campo di Battaglia",
  "tutorial.schier2Title": "Le zone di schieramento",
  "tutorial.schier2Body": "Una pedina in una Zona di Schieramento può muoversi soltanto in avanti verso il Campo di Battaglia", 
  "tutorial.schier3Title": "Le zone di schieramento",
  "tutorial.schier3Body": "Invece una pedina nel Campo di Battaglia può muoversi in qualsiasi direzione ma mai rientrare in una Zona di Schieramento.",
  "tutorial.catturaTitle": "Catturare una pedina avversaria",
  "tutorial.catturaBody": "Per catturare una pedina avversaria finisci il tuo movimento su di essa con il suo stesso sapore.",
  "tutorial.deploy1Title": "Schierare una pedina catturata",
  "tutorial.deploy1Body": "Le pedine catturate finiscono nella tua Riserva. Durante il tuo turno puoi schierare una pedina avversaria catturata in precedenza in una qualsiasi cella libera della tua Zona di Schieramento sotto il tuo controllo. Prova!",
  "tutorial.check1Title": "Dare Scacco al Re avversario",
  "tutorial.check1Body": "Per dare Scacco al Re avversario muoviti in una posizione in cui potresti catturarlo al turno successivo.",
  "tutorial.check2Title": "Dare Scacco al Re avversario",
  "tutorial.check2Body": "Se un Re si trova sotto Scacco, il giocatore deve per forza o spostarlo in una posizione sicura oppure usare un altro pezzo per rimuovere la minaccia. Se non ci riesce si dice Scacco Matto e il giocatore perde.",
  "tutorial.kings1Title": "I Re Neutrini",
  "tutorial.kings1Body": "Ogni giocatore controlla una armata di Pedine Neutrino e un Re Neutrino. Questi sono i pezzi più importanti del gioco.",
  "tutorial.kings2Title": "I Re Neutrini",
  "tutorial.kings2Body": "I Re Neutrini si muovono come qualsiasi altro pezzo ma non catturano. L'unica eccezione è che possono mettersi sotto scacco a vicenda. Prova a muovere il tuo Re!",
  "tutorial.check3Title": "Dare Scacco al Re avversario",
  "tutorial.check3Body": "Attenzione! Un Re può essere messo sotto scacco anche se si trova nella sua Zona di Schieramento! Prova!",
  "tutorial.endTitle": "Fine del Tutorial",
  "tutorial.endBody": "Perfetto, questa è la fine del tutorial! Ora divertiti a giocare e se hai altre domande consulta il manuale. Torna alla home page usando il tasto in alto a sinistra.",

  "tutorial.checkCorrectTitle": "Bravo!",
  "tutorial.checkWrongTitle": "Non è scacco!",
  "tutorial.checkCorrectBody": "Hai messo il re avversario sotto scacco.",
  "tutorial.checkWrongBody": "Questa mossa non dà scacco. Riprova!",
  "tutorial.continue": "Continua",
  "tutorial.checkRetry": "Riprova",
  "tutorial.backToMenu": "Torna alla home",


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
  "footer.project": "INFN GAME",
  "footer.author": "Andrea Ciarma",
  "footer.version": "v0.1.0",
  "footer.placeholder": "",

  "local.title": "Local game",
  "local.subtitle": "Two players, same device",
  "tutorial.title": "Tutorial",
  "tutorial.subtitle": "Learn to play step by step",
  "tutorial.placeholder": "The tutorial is coming soon: an interactive guide to the rules will appear here.",

  "tutorial.welcomeTitle": "Welcome to the Tutorial!",
  "tutorial.welcomeBody": "Here you'll learn the rules of Neutrino Arena step by step. Press Continue to begin.",
  "tutorial.continue": "Continue",
  "tutorial.flavoursTitle": "The Three Flavors",
  "tutorial.flavoursBody": "Just like neutrinos, our pieces come in three 'flavors': electron {e}, muon {m}, and tau {t}.",
  "tutorial.oscillationTitle": "Flavor Oscillation",
  "tutorial.oscillationBody": "As neutrinos travel, they can change their flavor through a phenomenon called Flavor Oscillation.",
  "tutorial.piecesTitle": "Our Pieces",
  "tutorial.piecesBody": "Our pieces can also change flavor as they move across the board!",
  "tutorial.oneStepTitle": "One Step",
  "tutorial.oneStepBody": "When moving one step, an electron neutrino stays an electron neutrino {ee}, while a muon neutrino becomes a tau neutrino and vice versa {mt}. Try moving the pieces one step!",
  "tutorial.twoStepTitle": "Two Steps",
  "tutorial.twoStepBody": "Great! When moving two steps, an electron neutrino can become either a muon or a tau neutrino, while muon and tau neutrinos become electron neutrinos. Try moving the pieces two steps!",
  "tutorial.freeStepTitle": "Free Movement",
  "tutorial.freeStepBody": "Perfect! Pieces can only move one or two cells. When you click on a piece, symbols will show you which moves are legal and which flavor the piece will have after moving. A two-step move can jump over any piece occupying the cell in between.",
  "tutorial.schier1Title": "Deployment Zones",
  "tutorial.schier1Body": "Some cells on the board are colored yellow or purple. These are called Deployment Zones, where the pieces are placed at the start of the game. The white cells in the center form the Battlefield.",
  "tutorial.schier2Title": "Deployment Zones",
  "tutorial.schier2Body": "A piece in a Deployment Zone can only move forward toward the Battlefield.",
  "tutorial.schier3Title": "Deployment Zones",
  "tutorial.schier3Body": "A piece on the Battlefield, on the other hand, can move in any direction but can never re-enter a Deployment Zone.",
  "tutorial.catturaTitle": "Capturing an Opponent's Piece",
  "tutorial.catturaBody": "To capture an opponent's piece, finish your move on its cell with the same flavor as that piece.",
  "tutorial.deploy1Title": "Deploying a Captured Piece",
  "tutorial.deploy1Body": "Captured pieces go into your Reserve. During your turn, you can deploy a previously captured opponent's piece onto any empty cell in your own Deployment Zone, under your control. Give it a try!",
  "tutorial.check1Title": "Putting the Opponent's King in Check",
  "tutorial.check1Body": "To put the opponent's King in check, move to a position from which you could capture it on your next turn.",
  "tutorial.check2Title": "Putting the Opponent's King in Check",
  "tutorial.check2Body": "If a King is in check, the player must either move it to a safe position or use another piece to remove the threat. If neither is possible, it's called Checkmate, and the player loses.",
  "tutorial.kings1Title": "The Neutrino Kings",
  "tutorial.kings1Body": "Each player controls an army of Neutrino Pieces and a Neutrino King. These are the most important pieces in the game.",
  "tutorial.kings2Title": "The Neutrino Kings",
  "tutorial.kings2Body": "Neutrino Kings move like any other piece, but they cannot capture. The only exception is that they can put each other in check. Try moving your King!",
  "tutorial.check3Title": "Putting the Opponent's King in Check",
  "tutorial.check3Body": "Watch out! A King can be put in check even while standing in its own Deployment Zone! Give it a try!",
  "tutorial.endTitle": "End of the Tutorial",
  "tutorial.endBody": "Perfect, you've reached the end of the tutorial! Now have fun playing, and if you have any questions, check the rulebook. Return to the home page using the button in the top-left corner.",
  "tutorial.checkCorrectTitle": "Well Done!",
  "tutorial.checkWrongTitle": "That's Not Check!",
  "tutorial.checkCorrectBody": "You've put the opponent's King in check.",
  "tutorial.checkWrongBody": "This move doesn't put the King in check. Try again!",
  "tutorial.checkRetry": "Try Again",
  "tutorial.backToMenu": "Back to Home",
  
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
