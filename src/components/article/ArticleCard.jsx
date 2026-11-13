import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Heart } from "lucide-react";
import { format } from "date-fns";

export default function ArticleCard({ article }) {
  const { t, i18n } = useTranslation();
  const date = article.publishedAt?.toDate ? article.publishedAt.toDate() : (article.publishedAt ? new Date(article.publishedAt) : null);
  const readTime = Math.max(1, Math.round((article.content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0) / 200));

  return (
    <article className="group">
      <Link to={`/article/${article.slug}`} className="block">
        {article.coverImage && (
          <div className="aspect-[16/9] overflow-hidden rounded-lg mb-4 bg-gray-100 dark:bg-gray-800">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {article.title}
        </h2>
        {article.subtitle && (
          <p className="mt-1 text-gray-600 dark:text-gray-400 line-clamp-2">{article.subtitle}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          {article.authorName && <span>{t("article.by")} {article.authorName}</span>}
          {date && <span>{format(date, "MMM d, yyyy")}</span>}
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{readTime} {t("article.minRead")}</span>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{article.claps || 0}</span>
        </div>
        {article.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}