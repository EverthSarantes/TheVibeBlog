import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getArticles, getAllTags } from "../lib/firestore";
import ArticleCard from "../components/article/ArticleCard";
import Spinner from "../components/ui/Spinner";
import { Tag } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (tag = null) => {
    setLoading(true);
    try {
      const [arts, ts] = await Promise.all([getArticles({ tag, max: 30 }), getAllTags()]);
      setArticles(arts || []);
      setTags(ts || []);
    } catch (e) {
      console.error(e);
      setArticles([]);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filterByTag = (tag) => {
    setActiveTag(tag);
    load(tag);
  };

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="container-page py-12 md:py-16">
      {/* Hero */}
      <section className="mb-12 md:mb-16 border-b border-ink-200 dark:border-ink-800 pb-12">
        <h1 className="font-display text-display-md md:text-display-lg text-ink-900 dark:text-white text-balance">
          {t("app.tagline")}
        </h1>
        <p className="mt-4 text-lg text-ink-600 dark:text-ink-400 max-w-2xl">
          {t("home.title")}
        </p>
      </section>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <button
            onClick={() => filterByTag(null)}
            className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${!activeTag ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white"}`}
          >
            {t("common.search") === "Buscar" ? "Todos" : "All"}
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => filterByTag(tag)}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium flex items-center gap-1.5 transition-colors ${activeTag === tag ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white"}`}
            >
              <Tag className="w-3 h-3" /> {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-24"><Spinner /></div>
      ) : articles.length === 0 ? (
        <p className="text-center text-ink-500 py-24 font-serif text-lg">{t("home.empty")}</p>
      ) : (
        <>
          {/* Featured */}
          {featured && !activeTag && (
            <section className="mb-16">
              <ArticleCard article={featured} />
            </section>
          )}

          {/* Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {(activeTag ? articles : rest).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}