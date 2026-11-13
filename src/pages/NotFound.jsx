import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-display-lg text-ink-300 dark:text-ink-700">404</p>
      <p className="mt-4 text-ink-600 dark:text-ink-400 font-serif">{t("common.error")}</p>
      <Link to="/" className="mt-8">
        <button className="px-5 py-2.5 rounded-md bg-ink-900 text-white dark:bg-white dark:text-ink-900 font-sans text-sm font-medium hover:bg-ink-800 dark:hover:bg-ink-100 transition-colors">
          {t("common.back")}
        </button>
      </Link>
    </div>
  );
}