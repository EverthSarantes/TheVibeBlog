import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getArticleBySlug, incrementViews, clapArticle, deleteArticle } from "../lib/firestore";
import { useAuth } from "../contexts/AuthContext";
import CommentSection from "../components/comments/CommentSection";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import { Heart, Eye, Clock, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

export default function Article() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { user, isAdmin, isWriter } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clapped, setClapped] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const a = await getArticleBySlug(slug);
        setArticle(a);
        if (a) incrementViews(a.id).catch(() => {});
      } catch (e) {
        console.error(e);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleClap = async () => {
    if (!article || clapped) return;
    setClapped(true);
    await clapArticle(article.id, 1);
    setArticle((prev) => ({ ...prev, claps: (prev.claps || 0) + 1 }));
  };

  const handleDelete = async () => {
    if (!window.confirm(t("article.confirmDelete"))) return;
    await deleteArticle(article.id);
    navigate("/");
  };

  if (loading) return <div className="py-20"><Spinner /></div>;
  if (!article) return <div className="py-20 text-center text-gray-500">Article not found</div>;

  const date = article.publishedAt?.toDate ? article.publishedAt.toDate() : (article.publishedAt ? new Date(article.publishedAt) : null);
  const readTime = Math.max(1, Math.round((article.content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0) / 200));
  const canEdit = user && (user.uid === article.authorId || isAdmin);

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      {article.coverImage && (
        <div className="aspect-[16/9] overflow-hidden rounded-xl mb-8 bg-gray-100 dark:bg-gray-800">
          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
        {article.title}
      </h1>
      {article.subtitle && (
        <p className="mt-3 text-xl text-gray-600 dark:text-gray-400">{article.subtitle}</p>
      )}

      <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        {article.authorPhoto && <img src={article.authorPhoto} alt="" className="w-10 h-10 rounded-full" />}
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{article.authorName}</p>
          <div className="flex items-center gap-3 text-xs">
            {date && <span>{format(date, "MMM d, yyyy")}</span>}
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime} {t("article.minRead")}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views || 0} {t("article.views")}</span>
          </div>
        </div>
        {canEdit && (
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => navigate(`/edit/${article.id}`)}>
              <Edit className="w-4 h-4 mr-1" /> {t("article.edit")}
            </Button>
            <Button size="sm" variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {article.tags?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link key={tag} to={`/?tag=${tag}`} className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              {tag}
            </Link>
          ))}
        </div>
      )}

      <div
        className="prose prose-lg dark:prose-invert max-w-none mt-8"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || "") }}
      />

      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={handleClap}
          disabled={clapped}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-colors ${clapped ? "bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400" : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          <Heart className={`w-5 h-5 ${clapped ? "fill-current" : ""}`} />
          <span>{article.claps || 0} {t("article.claps")}</span>
        </button>
      </div>

      <CommentSection articleId={article.id} />

      {/* Newsletter CTA */}
      <div className="mt-12 p-6 rounded-xl bg-gray-100 dark:bg-gray-800">
        <h4 className="text-lg font-bold mb-2">{t("newsletter.title")}</h4>
        <NewsletterInline />
      </div>
    </article>
  );
}

function NewsletterInline() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    const { subscribeNewsletter } = await import("../lib/firestore");
    const r = await subscribeNewsletter(email);
    setStatus(r);
    if (r === "ok") setEmail("");
  };
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("newsletter.placeholder")}
        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
      />
      <Button type="submit">{t("newsletter.button")}</Button>
      {status && <span className="text-sm text-green-600 ml-2">{t(status === "ok" ? "newsletter.success" : "newsletter.already")}</span>}
    </form>
  );
}