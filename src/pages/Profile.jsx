import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile, getArticles } from "../lib/firestore";
import { upsertUserProfile } from "../lib/firestore";
import ArticleCard from "../components/article/ArticleCard";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

export default function Profile() {
  const { uid } = useParams();
  const { t } = useTranslation();
  const { user, profile: myProfile, refreshProfile } = useAuth();
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
      const p = await getUserProfile(uid);
      setProfile(p);
      setBio(p?.bio || "");
      setDisplayName(p?.displayName || "");
      const arts = await getArticles({ authorId: uid, status: "published", max: 30 });
      setArticles(arts);
      setLoading(false);
    })();
  }, [uid]);

  const handleSave = async () => {
    setSaving(true);
    await upsertUserProfile(uid, { displayName, bio });
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  if (loading) return <div className="py-20"><Spinner /></div>;
  if (!profile) return <div className="py-20 text-center text-gray-500">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-6 mb-8">
        {profile.photoURL ? (
          <img src={profile.photoURL} alt="" className="w-24 h-24 rounded-full" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700" />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{profile.displayName}</h1>
          <p className="text-gray-500 capitalize">{profile.role}</p>
          {profile.bio && <p className="mt-2 text-gray-700 dark:text-gray-300">{profile.bio}</p>}
        </div>
      </div>

      {isMe && (
        <section className="mb-10 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4">{t("profile.save")}</h2>
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

      <h2 className="text-2xl font-bold mb-6">{t("profile.articles")}</h2>
      {articles.length === 0 ? (
        <p className="text-gray-500">No articles yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}