import { useEffect, useState } from "react";
import { Volume2, VolumeOff } from "lucide-react";
import { isSoundEnabled, toggleSound } from "@/lib/sound";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isSoundEnabled());
  }, []);

  const handleClick = () => {
    setEnabled(toggleSound());
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-foreground shadow-sm transition hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={enabled ? "Disattiva suono" : "Attiva suono"}
      title={enabled ? "Suono attivo" : "Suono disattivato"}
    >
      {enabled ? <Volume2 size={18} /> : <VolumeOff size={18} />}
    </button>
  );
}
