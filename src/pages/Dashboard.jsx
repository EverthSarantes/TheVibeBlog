import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { getArticles, createInvitation, getNewsletterSubscribers } from "../lib/firestore";
import AuthGuard from "../components/auth/AuthGuard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import { Link } from "react-router-dom";
import { Users, Mail, FileText, Plus } from "lucide-react";

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
    const [arts, subs] = await Promise.all([
      getArticles({ authorId: user.uid, status: "published", max: 50 }),
      getNewsletterSubscribers(),
    ]);
    // also drafts
    const drafts = await getArticles({ authorId: user.uid, status: "draft", max: 50 });
    setArticles([...drafts, ...arts]);
    setSubscribers(subs);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    await createInvitation(inviteEmail.trim(), user.uid);
    setInviteStatus("sent");
    setInviteEmail("");
    setTimeout(() => setInviteStatus(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">{t("dashboard.title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 rounded-xl bg-gray-100 dark:bg-gray-800">
          <FileText className="w-8 h-8 mb-2 text-blue-600" />
          <p className="text-2xl font-bold">{articles.length}</p>
          <p className="text-sm text-gray-500">{t("dashboard.myArticles")}</p>
        </div>
        <div className="p-6 rounded-xl bg-gray-100 dark:bg-gray-800">
          <Mail className="w-8 h-8 mb-2 text-green-600" />
          <p className="text-2xl font-bold">{subscribers.length}</p>
          <p className="text-sm text-gray-500">{t("dashboard.subscribers")}</p>
        </div>
        <div className="p-6 rounded-xl bg-gray-100 dark:bg-gray-800 flex flex-col justify-between">
          <div>
            <Plus className="w-8 h-8 mb-2 text-purple-600" />
            <p className="text-sm text-gray-500">{t("nav.write")}</p>
          </div>
          <Link to="/write">
            <Button size="sm" className="mt-2">{t("nav.write")}</Button>
          </Link>
        </div>
      </div>

      {/* Invite writer */}
      <section className="mb-10 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
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
          <p className="mt-2 text-sm text-green-600">{t("dashboard.inviteSent")}</p>
        )}
      </section>

      {/* Articles list */}
      <section>
        <h2 className="text-xl font-bold mb-4">{t("dashboard.myArticles")}</h2>
        {loading ? (
          <Spinner />
        ) : articles.length === 0 ? (
          <p className="text-gray-500">{t("dashboard.noArticles")}</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {articles.map((a) => (
              <li key={a.id} className="py-4 flex items-center justify-between">
                <div>
                  <Link to={`/article/${a.slug}`} className="font-semibold hover:underline">{a.title}</Link>
                  <p className="text-sm text-gray-500">
                    {a.status === "draft" ? t("editor.draft") : t("editor.published")} · {a.claps || 0} claps
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/edit/${a.id}`}>
                    <Button size="sm" variant="secondary">Edit</Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}