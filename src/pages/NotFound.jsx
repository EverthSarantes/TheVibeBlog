import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">{t("common.error")}</p>
      <Link to="/" className="mt-6">
        <button className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black">{t("common.back")}</button>
      </Link>
    </div>
  );
}