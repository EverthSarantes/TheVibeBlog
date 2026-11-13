import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-ink-200 dark:border-ink-800 mt-24">
      <div className="max-w-container mx-auto px-6 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink-500 dark:text-ink-400">
        <p>© {new Date().getFullYear()} {t("app.name")}. {t("footer.rights")}.</p>
        <p className="font-display italic">Ideas that vibrate.</p>
      </div>
    </footer>
  );
}