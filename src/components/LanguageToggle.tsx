import { useI18n, type Lang } from "@/lib/i18n";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const options: Lang[] = ["it", "en"];

  return (
    <div
      className={`inline-flex items-center rounded-full border border-border/60 bg-card p-0.5 text-xs font-medium shadow-sm ${className}`}
      role="group"
      aria-label="Language"
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => setLang(opt)}
          aria-pressed={lang === opt}
          className={`rounded-full px-2.5 py-1 uppercase tracking-wide transition ${
            lang === opt
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
