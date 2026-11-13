import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Heart } from "lucide-react";
import { format } from "date-fns";

export default function ArticleCard({ article }) {
  const { t } = useTranslation();
  const date = article.publishedAt?.toDate ? article.publishedAt.toDate() : (article.publishedAt ? new Date(article.publishedAt) : null);
  const readTime = Math.max(1, Math.round((article.content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0) / 200));

  return (
    <article className="group">
      <Link to={`/article/${article.slug}`} className="block">
        {article.coverImage && (
          <div className="aspect-[4/3] overflow-hidden rounded-md mb-4 bg-ink-100 dark:bg-ink-800">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-smooth"
              loading="lazy"
            />
          </div>
        )}
        <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white group-hover:text-accent transition-colors leading-tight">
          {article.title}
        </h2>
        {article.subtitle && (
          <p className="mt-2 text-ink-600 dark:text-ink-400 leading-snug line-clamp-2">{article.subtitle}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-ink-500 dark:text-ink-400 font-sans">
          {article.authorName && <span className="font-medium text-ink-700 dark:text-ink-300">{article.authorName}</span>}
          {date && <span>{format(date, "MMM d, yyyy")}</span>}
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime} {t("article.minRead")}</span>
        </div>
        {article.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 text-ink-600 dark:text-ink-400 border border-ink-200 dark:border-ink-700 rounded-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}