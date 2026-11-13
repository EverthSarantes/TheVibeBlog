import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} {t("app.name")}. {t("footer.rights")}.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-4 h-4 text-red-500" /> vibecoding
        </p>
      </div>
    </footer>
  );
}