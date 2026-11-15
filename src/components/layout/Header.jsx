import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "../ui/Button";
import { PenSquare, Sun, Moon, User, LogOut, Search } from "lucide-react";

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, profile, isWriter, login, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const switchLang = () => {
    const next = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur border-b border-ink-200 dark:border-ink-800">
      <div className="max-w-container mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-display font-bold tracking-tight text-ink-900 dark:text-white">
            {t("app.name")}
          </span>
        </Link>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder={t("nav.search")}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 text-sm text-ink-900 dark:text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  navigate(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
                }
              }}
            />
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <button
            onClick={switchLang}
            className="px-2 py-1 text-xs font-semibold rounded-md text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          >
            {i18n.language === "es" ? "EN" : "ES"}
          </button>
          <button
            onClick={toggle}
            className="p-2 rounded-md text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            aria-label="toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isWriter && (
            <Button size="sm" onClick={() => navigate("/write")} className="hidden sm:inline-flex">
              <PenSquare className="w-4 h-4 mr-1.5" /> {t("nav.write")}
            </Button>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-sm text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white transition-colors hidden sm:block">
                {t("nav.dashboard")}
              </Link>
              <Link to={`/u/${profile?.uid || user.uid}`} className="block">
                {(profile?.photoURL || user?.photoURL) ? (
                  <img src={profile?.photoURL || user?.photoURL} alt="" className="w-8 h-8 rounded-full ring-1 ring-ink-200 dark:ring-ink-700 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-ink-200 dark:bg-ink-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-ink-600 dark:text-ink-300" />
                  </div>
                )}
              </Link>
              <button onClick={logout} aria-label="logout" className="p-2 text-ink-500 hover:text-ink-900 dark:hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button size="sm" onClick={login}>{t("nav.login")}</Button>
          )}
        </nav>
      </div>
    </header>
  );
}