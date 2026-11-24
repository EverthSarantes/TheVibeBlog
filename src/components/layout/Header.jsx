import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "../ui/Button";
import { PenSquare, Sun, Moon, User, LogOut, Search, Shield, Menu, X } from "lucide-react";

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, profile, isWriter, isAdmin, login, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const switchLang = () => {
    const next = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const closeMenu = () => setMobileMenuOpen(false);

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
          {/* Language toggle hidden - Spanish only. Functionality preserved for future use.
          <button
            onClick={switchLang}
            className="px-2 py-1 text-xs font-semibold rounded-md text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          >
            {i18n.language === "es" ? "EN" : "ES"}
          </button>
          */}

          {user ? (
            <div className="flex items-center gap-2">
              {/* Mobile: menu button first, then profile avatar */}
              {user && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden p-2 rounded-md text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                  aria-label="menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}

              {/* Desktop: write button + links */}
              {isWriter && (
                <Button size="sm" onClick={() => navigate("/write")} className="hidden sm:inline-flex">
                  <PenSquare className="w-4 h-4 mr-1.5" /> {t("nav.write")}
                </Button>
              )}
              {isWriter && (
                <Link to="/dashboard" className="text-sm text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white transition-colors hidden sm:block">
                  {t("nav.dashboard")}
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-sm text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white transition-colors hidden sm:flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </Link>
              )}

              <Link to={`/u/${profile?.uid || user.uid}`} className="block">
                {(profile?.photoURL || user?.photoURL) ? (
                  <img src={profile?.photoURL || user?.photoURL} alt="" className="w-8 h-8 rounded-full ring-1 ring-ink-200 dark:ring-ink-700 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-ink-200 dark:bg-ink-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-ink-600 dark:text-ink-300" />
                  </div>
                )}
              </Link>

              {/* Desktop: logout + theme toggle */}
              <button onClick={toggle} aria-label="toggle theme" className="hidden sm:block p-2 rounded-md text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={logout} aria-label="logout" className="hidden sm:block p-2 text-ink-500 hover:text-ink-900 dark:hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={toggle}
                className="p-2 rounded-md text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                aria-label="toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Button size="sm" onClick={login}>{t("nav.login")}</Button>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile menu dropdown */}
      {user && mobileMenuOpen && (
        <div className="sm:hidden border-t border-ink-200 dark:border-ink-800 bg-surface dark:bg-surface-dark">
          <div className="px-6 py-4 space-y-1">
            {isWriter && (
              <button
                onClick={() => { navigate("/write"); closeMenu(); }}
                className="w-full flex items-center gap-2 py-2 text-sm font-medium text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white"
              >
                <PenSquare className="w-4 h-4" /> {t("nav.write")}
              </button>
            )}
            {isWriter && (
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="flex items-center gap-2 py-2 text-sm font-medium text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white"
              >
                {t("nav.dashboard")}
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={closeMenu}
                className="flex items-center gap-2 py-2 text-sm font-medium text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white"
              >
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            <div className="border-t border-ink-200 dark:border-ink-800 pt-2 mt-2 space-y-1">
              <button
                onClick={() => { toggle(); closeMenu(); }}
                className="w-full flex items-center gap-2 py-2 text-sm font-medium text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === "dark" ? "Modo claro" : "Modo oscuro"}
              </button>
              <button
                onClick={() => { logout(); closeMenu(); }}
                className="w-full flex items-center gap-2 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}