import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/40 bg-background/80 py-4 text-center text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 sm:flex-row sm:gap-6">
        <span className="font-medium">{t("footer.project")}</span>
        <span className="hidden sm:inline">·</span>
        <span>{t("footer.author")}</span>
        <span className="hidden sm:inline">·</span>
        <span>{t("footer.version")}</span>
      </div>
      <div className="mt-2 text-[10px] opacity-60">
        {t("footer.placeholder")}
      </div>
    </footer>
  );
}
