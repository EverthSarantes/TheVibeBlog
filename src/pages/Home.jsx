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
    const [arts, ts] = await Promise.all([getArticles({ tag, max: 30 }), getAllTags()]);
    setArticles(arts);
    setTags(ts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filterByTag = (tag) => {
    setActiveTag(tag);
    load(tag);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("app.tagline")}
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          {t("home.title")}
        </p>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => filterByTag(null)}
            className={`px-3 py-1.5 rounded-full text-sm ${!activeTag ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
          >
            {t("common.search") === "Buscar" ? "Todos" : "All"}
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => filterByTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${activeTag === tag ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
            >
              <Tag className="w-3 h-3" /> {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-20"><Spinner /></div>
      ) : articles.length === 0 ? (
        <p className="text-center text-gray-500 py-20">{t("home.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}