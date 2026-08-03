import { useState } from "react";
import { X, FileText } from "lucide-react";
import { getRulesPdfPath, useI18n } from "@/lib/i18n";

export default function PdfViewerModal() {
  const { t, lang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
      >
        <FileText className="h-5 w-5" />
        {t("rules.open")}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-background"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-semibold">{t("rules.title")}</h2>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t("rules.close")}
                className="rounded-md p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <iframe
              src={getRulesPdfPath(lang)}
              title={t("rules.title")}
              className="h-full w-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
