// Simple synthesized "click/thud" sound for piece moves (no audio assets needed).
let ctx: AudioContext | null = null;
let soundEnabled = true;
let preferenceLoaded = false;

function loadPreference() {
  if (typeof window === "undefined") return;
  if (preferenceLoaded) return;
  const stored = localStorage.getItem("neutrino-sound");
  if (stored !== null) soundEnabled = stored === "true";
  preferenceLoaded = true;
}

function savePreference() {
  if (typeof window === "undefined") return;
  localStorage.setItem("neutrino-sound", String(soundEnabled));
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

export function isSoundEnabled(): boolean {
  loadPreference();
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  savePreference();
}

export function toggleSound(): boolean {
  loadPreference();
  soundEnabled = !soundEnabled;
  savePreference();
  return soundEnabled;
}

export function playMoveSound(kind: "move" | "capture" = "move") {
  loadPreference();
  if (!soundEnabled) return;
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();

  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = kind === "capture" ? "square" : "triangle";
  const start = kind === "capture" ? 420 : 640;
  const end = kind === "capture" ? 120 : 260;
  osc.frequency.setValueAtTime(start, now);
  osc.frequency.exponentialRampToValueAtTime(end, now + 0.12);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(kind === "capture" ? 0.22 : 0.14, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.18);
}
