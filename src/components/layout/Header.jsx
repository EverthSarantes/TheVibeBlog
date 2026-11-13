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
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("app.name")}
          </span>
        </Link>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("nav.search")}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-2 py-1 text-xs font-semibold rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {i18n.language === "es" ? "EN" : "ES"}
          </button>
          <button
            onClick={toggle}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isWriter && (
            <Button size="sm" onClick={() => navigate("/write")} className="hidden sm:inline-flex">
              <PenSquare className="w-4 h-4 mr-1" /> {t("nav.write")}
            </Button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="text-sm text-gray-700 dark:text-gray-300 hover:underline hidden sm:block">
                {t("nav.dashboard")}
              </Link>
              <Link to={`/u/${profile?.uid || user.uid}`}>
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="w-8 h-8 p-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                )}
              </Link>
              <button onClick={logout} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
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