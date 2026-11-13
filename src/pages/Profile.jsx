import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile, getArticles, upsertUserProfile } from "../lib/firestore";
import ArticleCard from "../components/article/ArticleCard";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

export default function Profile() {
  const { uid } = useParams();
  const { t } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const isMe = user && user.uid === uid;
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getUserProfile(uid);
        setProfile(p);
        setBio(p?.bio || "");
        setDisplayName(p?.displayName || "");
        const arts = await getArticles({ authorId: uid, status: "published", max: 30 });
        setArticles(arts || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertUserProfile(uid, { displayName, bio });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-32"><Spinner /></div>;
  if (!profile) return <div className="py-32 text-center font-serif text-ink-500">User not found</div>;

  return (
    <div className="container-page py-12 md:py-16">
      <div className="flex flex-col md:flex-row items-start gap-8 mb-12 pb-12 border-b border-ink-200 dark:border-ink-800">
        {profile.photoURL ? (
          <img src={profile.photoURL} alt="" className="w-28 h-28 rounded-full ring-1 ring-ink-200 dark:ring-ink-700" />
        ) : (
          <div className="w-28 h-28 rounded-full bg-ink-200 dark:bg-ink-700 flex items-center justify-center">
            <span className="font-display text-4xl text-ink-600 dark:text-ink-300">{profile.displayName?.[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-display-sm text-ink-900 dark:text-white">{profile.displayName}</h1>
          <p className="text-sm font-sans font-medium uppercase tracking-wider text-ink-500 dark:text-ink-400 mt-1">{profile.role}</p>
          {profile.bio && <p className="mt-4 text-ink-700 dark:text-ink-300 font-serif leading-relaxed max-w-prose">{profile.bio}</p>}
        </div>
      </div>

      {isMe && (
        <section className="mb-12 p-6 rounded-md border border-ink-200 dark:border-ink-800">
          <h2 className="font-display text-xl font-bold mb-4 text-ink-900 dark:text-white">Edit profile</h2>
          <div className="space-y-4 max-w-md">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} label="Name" />
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} label={t("profile.bio")} rows={3} />
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>{saving ? "..." : t("profile.save")}</Button>
              {saved && <span className="text-green-600 text-sm">{t("profile.saved")}</span>}
            </div>
          </div>
        </section>
      )}

      <h2 className="font-display text-2xl font-bold mb-6 text-ink-900 dark:text-white">{t("profile.articles")}</h2>
      {articles.length === 0 ? (
        <p className="text-ink-500 font-serif italic">No articles yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}