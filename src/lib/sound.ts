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

function playNote(
  ac: AudioContext,
  freq: number,
  start: number,
  duration: number,
  peak: number,
  type: OscillatorType = "triangle",
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Triumphant fanfare for a victory. */
export function playVictorySound() {
  loadPreference();
  if (!soundEnabled) return;
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  const t0 = ac.currentTime + 0.02;
  // C5 - E5 - G5 - C6
  const seq: [number, number, number][] = [
    [523.25, 0.0, 0.18],
    [659.25, 0.16, 0.18],
    [783.99, 0.32, 0.22],
    [1046.5, 0.54, 0.6],
  ];
  for (const [freq, offset, dur] of seq) {
    playNote(ac, freq, t0 + offset, dur, 0.16, "square");
    playNote(ac, freq * 2, t0 + offset, dur, 0.05, "triangle");
  }
}

/** Sad descending trumpet for a defeat. */
export function playDefeatSound() {
  loadPreference();
  if (!soundEnabled) return;
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  const t0 = ac.currentTime + 0.02;
  const seq: [number, number, number][] = [
    [392.0, 0.0, 0.22],
    [369.99, 0.24, 0.22],
    [349.23, 0.48, 0.26],
    [311.13, 0.74, 0.8],
  ];
  for (const [freq, offset, dur] of seq) {
    playNote(ac, freq, t0 + offset, dur, 0.16, "sawtooth");
  }
  // Slow pitch droop on the final note.
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(311.13, t0 + 0.74);
  osc.frequency.exponentialRampToValueAtTime(220, t0 + 1.5);
  gain.gain.setValueAtTime(0.0001, t0 + 0.74);
  gain.gain.exponentialRampToValueAtTime(0.1, t0 + 0.8);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.55);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0 + 0.74);
  osc.stop(t0 + 1.6);
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
