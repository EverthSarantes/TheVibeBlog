import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { getArticles, createInvitation, getNewsletterSubscribers } from "../lib/firestore";
import AuthGuard from "../components/auth/AuthGuard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import { Link } from "react-router-dom";
import { Users, Mail, FileText, Plus, Edit } from "lucide-react";

export default function Dashboard() {
  return (
    <AuthGuard requireWriter>
      <DashboardInner />
    </AuthGuard>
  );
}

function DashboardInner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState(null);
  const [subscribers, setSubscribers] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [arts, drafts, subs] = await Promise.all([
        getArticles({ authorId: user.uid, status: "published", max: 50 }),
        getArticles({ authorId: user.uid, status: "draft", max: 50 }),
        getNewsletterSubscribers(),
      ]);
      setArticles([...(drafts || []), ...(arts || [])]);
      setSubscribers(subs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await createInvitation(inviteEmail.trim(), user.uid);
      setInviteStatus("sent");
      setInviteEmail("");
      setTimeout(() => setInviteStatus(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container-page py-12 md:py-16">
      <p className="text-xs font-sans font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">
        {t("dashboard.title")}
      </p>
      <h1 className="font-display text-display-sm text-ink-900 dark:text-white mb-10">
        {t("dashboard.title")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-md border border-ink-200 dark:border-ink-800 bg-surface dark:bg-surface-dark">
          <FileText className="w-6 h-6 mb-3 text-ink-400" />
          <p className="font-display text-3xl font-bold text-ink-900 dark:text-white">{articles.length}</p>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{t("dashboard.myArticles")}</p>
        </div>
        <div className="p-6 rounded-md border border-ink-200 dark:border-ink-800 bg-surface dark:bg-surface-dark">
          <Mail className="w-6 h-6 mb-3 text-ink-400" />
          <p className="font-display text-3xl font-bold text-ink-900 dark:text-white">{subscribers.length}</p>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{t("dashboard.subscribers")}</p>
        </div>
        <div className="p-6 rounded-md border border-ink-200 dark:border-ink-800 bg-surface dark:bg-surface-dark flex flex-col justify-between">
          <div>
            <Plus className="w-6 h-6 mb-3 text-ink-400" />
            <p className="text-sm text-ink-500 dark:text-ink-400">{t("nav.write")}</p>
          </div>
          <Link to="/write" className="mt-4">
            <Button size="sm" className="w-full">{t("nav.write")}</Button>
          </Link>
        </div>
      </div>

      <section className="mb-12 p-6 rounded-md border border-ink-200 dark:border-ink-800">
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2 text-ink-900 dark:text-white">
          <Users className="w-5 h-5" /> {t("dashboard.inviteWriter")}
        </h2>
        <form onSubmit={handleInvite} className="flex gap-2 max-w-md">
          <Input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder={t("dashboard.invitePlaceholder")}
          />
          <Button type="submit">{t("dashboard.inviteWriter")}</Button>
        </form>
        {inviteStatus === "sent" && (
          <p className="mt-3 text-sm text-green-600">{t("dashboard.inviteSent")}</p>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold mb-4 text-ink-900 dark:text-white">{t("dashboard.myArticles")}</h2>
        {loading ? (
          <Spinner />
        ) : articles.length === 0 ? (
          <p className="text-ink-500 font-serif italic">{t("dashboard.noArticles")}</p>
        ) : (
          <ul className="divide-y divide-ink-200 dark:divide-ink-800">
            {articles.map((a) => (
              <li key={a.id} className="py-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/article/${a.slug}`} className="font-display font-semibold text-ink-900 dark:text-white hover:text-accent transition-colors">
                    {a.title}
                  </Link>
                  <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
                    {a.status === "draft" ? t("editor.draft") : t("editor.published")} · {a.claps || 0} claps · {a.views || 0} views
                  </p>
                </div>
                <Link to={`/edit/${a.id}`}>
                  <Button size="sm" variant="secondary"><Edit className="w-3.5 h-3.5 mr-1" /> Editar</Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}