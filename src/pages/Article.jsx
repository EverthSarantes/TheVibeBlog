import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getArticleBySlug, incrementViews, toggleLike, deleteArticle } from "../lib/firestore";
import { useAuth } from "../contexts/AuthContext";
import CommentSection from "../components/comments/CommentSection";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import DOMPurify from "dompurify";
import { Heart, Eye, Clock, Trash2, Edit, Share2 } from "lucide-react";
import { format } from "date-fns";
import { es as esLocale } from "date-fns/locale";

export default function Article() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [shareMsg, setShareMsg] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const a = await getArticleBySlug(slug);
        setArticle(a);
        if (a && user) {
          setLiked((a.likedBy || []).includes(user.uid));
        }
        if (a) {
          document.title = `${a.title} — VibeBlog`;
          // JSON-LD structured data
          const script = document.createElement("script");
          script.type = "application/ld+json";
          script.id = "article-jsonld";
          script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.subtitle || "",
            author: { "@type": "Person", name: a.authorName },
            datePublished: a.publishedAt,
            image: a.coverImage || "",
          });
          const existing = document.getElementById("article-jsonld");
          if (existing) existing.remove();
          document.head.appendChild(script);
          incrementViews(a.id).catch(() => {});
        }
      } catch (e) {
        console.error(e);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    })();
    return () => { document.title = "VibeBlog"; };
  }, [slug]);

  useEffect(() => {
    if (article && user) {
      setLiked((article.likedBy || []).includes(user.uid));
    } else if (!user) {
      setLiked(false);
    }
  }, [user, article]);

  const handleLike = async () => {
    if (!article || !user) {
      // Redirect to login or show message
      return;
    }
    const newLiked = await toggleLike(article.id, user.uid);
    setLiked(newLiked);
    setArticle((prev) => ({
      ...prev,
      claps: newLiked ? (prev.claps || 0) + 1 : Math.max(0, (prev.claps || 0) - 1),
      likedBy: newLiked
        ? [...(prev.likedBy || []), user.uid]
        : (prev.likedBy || []).filter((u) => u !== user.uid),
    }));
  };

  const handleDelete = async () => {
    if (!window.confirm(t("article.confirmDelete"))) return;
    await deleteArticle(article.id);
    navigate("/");
  };

  if (loading) return <div className="py-32"><Spinner /></div>;
  if (!article) return <div className="py-32 text-center font-serif text-ink-500">Artículo no encontrado</div>;

  const date = article.publishedAt?.toDate ? article.publishedAt.toDate() : (article.publishedAt ? new Date(article.publishedAt) : null);
  const readTime = Math.max(1, Math.round((article.content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0) / 200));
  const canEdit = user && (user.uid === article.authorId || isAdmin);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url: window.location.href });
        setShareMsg(true);
        setTimeout(() => setShareMsg(false), 2000);
        return;
      }
      // Fallback: try clipboard API
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch (e) {
        // Fallback for older browsers / unfocused documents
        const textarea = document.createElement("textarea");
        textarea.value = window.location.href;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setShareMsg(true);
      setTimeout(() => setShareMsg(false), 2000);
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e);
      }
    }
  };

  return (
    <article className="max-w-article mx-auto px-6 md:px-8 py-12 md:py-16">
      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map((tag) => (
            <Link key={tag} to={`/?tag=${tag}`} className="text-xs font-sans font-medium uppercase tracking-wider text-accent hover:text-accent-hover">
              {tag}
            </Link>
          ))}
        </div>
      )}

      <h1 className="font-display text-display-sm md:text-display-md text-ink-900 dark:text-white leading-tight text-balance">
        {article.title}
      </h1>

      {article.subtitle && (
        <p className="mt-4 text-xl md:text-2xl text-ink-600 dark:text-ink-400 font-serif leading-snug">
          {article.subtitle}
        </p>
      )}

      {/* Author row */}
      <div className="mt-8 flex items-center gap-4 pb-8 border-b border-ink-200 dark:border-ink-800">
        <Link to={`/u/${article.authorId}`} className="flex-shrink-0">
          {article.authorPhoto ? (
            <img src={article.authorPhoto} alt="" className="w-12 h-12 rounded-full ring-1 ring-ink-200 dark:ring-ink-700" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-ink-200 dark:bg-ink-700 flex items-center justify-center">
              <span className="font-display text-lg text-ink-600 dark:text-ink-300">{article.authorName?.[0]}</span>
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/u/${article.authorId}`} className="font-sans font-semibold text-ink-900 dark:text-white hover:text-accent transition-colors">
            {article.authorName}
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500 dark:text-ink-400 mt-0.5">
            {date && <time>{format(date, "d 'de' MMMM, yyyy", { locale: esLocale })}</time>}
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{readTime} {t("article.minRead")}</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{article.views || 0}</span>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => navigate(`/edit/${article.id}`)}>
              <Edit className="w-4 h-4 mr-1.5" /> {t("article.edit")}
            </Button>
            <Button size="sm" variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Cover image */}
      {article.coverImage ? (
        <div className="my-10 -mx-6 md:-mx-8">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full rounded-md"
            loading="eager"
            decoding="async"
          />
        </div>
      ) : (
        <div className="my-10 h-px bg-ink-200 dark:bg-ink-800" />
      )}

      {/* Content */}
      <div
        className="article-prose mt-8"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || "") }}
      />

      {/* Actions */}
      <div className="mt-12 flex items-center gap-4 pt-8 border-t border-ink-200 dark:border-ink-800">
        <button
          onClick={handleLike}
          disabled={!user}
          title={!user ? t("comments.loginToComment") : ""}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-md border transition-colors font-sans text-sm font-medium ${liked ? "bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400" : "border-ink-300 dark:border-ink-600 text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Heart className={`w-4 h-4 transition-transform ${liked ? "fill-current scale-110" : ""}`} />
          {article.claps || 0} {t("article.claps")}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-5 py-2.5 rounded-md border border-ink-300 dark:border-ink-600 text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors font-sans text-sm font-medium"
        >
          <Share2 className="w-4 h-4" /> {t("article.share")}
        </button>
        {shareMsg && (
          <span className="text-sm text-green-600 dark:text-green-400 font-sans">
            {t("common.copied") || "Link copied!"}
          </span>
        )}
      </div>

      <CommentSection articleId={article.id} />

      {/* Newsletter CTA */}
      <div className="mt-16 p-8 rounded-md bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800">
        <h4 className="font-display text-2xl font-bold mb-2">{t("newsletter.title")}</h4>
        <p className="text-ink-600 dark:text-ink-400 mb-4 text-sm">Recibe los mejores artículos en tu correo.</p>
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
    <form onSubmit={submit} className="flex gap-2 max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("newsletter.placeholder")}
        className="flex-1 px-4 py-2.5 rounded-md border border-ink-300 dark:border-ink-600 bg-white dark:bg-ink-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <Button type="submit">{t("newsletter.button")}</Button>
      {status && <span className="text-sm text-green-600 ml-2 self-center">{t(status === "ok" ? "newsletter.success" : "newsletter.already")}</span>}
    </form>
  );
}