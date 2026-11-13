import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";
import { LogIn } from "lucide-react";

export default function Login() {
  const { t } = useTranslation();
  const { login, user } = useAuth();
  if (user) window.location.href = "/";
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="font-display text-display-sm text-ink-900 dark:text-white mb-3">{t("auth.loginTitle")}</h1>
        <p className="text-ink-600 dark:text-ink-400 font-serif mb-10">{t("auth.loginSubtitle")}</p>
        <Button size="lg" onClick={login} className="w-full">
          <LogIn className="w-5 h-5 mr-2" /> {t("auth.loginGoogle")}
        </Button>
      </div>
    </div>
  );
}