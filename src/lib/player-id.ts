// Stable per-browser player id, saved in localStorage.
const KEY = "rombo:player-id";

export function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
