import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getArticles } from "../lib/firestore";
import ArticleCard from "../components/article/ArticleCard";
import Spinner from "../components/ui/Spinner";

export default function Search() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const all = await getArticles({ max: 100 });
        const lower = q.toLowerCase();
        const filtered = (all || []).filter((a) =>
          a.title?.toLowerCase().includes(lower) ||
          a.subtitle?.toLowerCase().includes(lower) ||
          a.content?.toLowerCase().includes(lower) ||
          a.tags?.some((tag) => tag.toLowerCase().includes(lower))
        );
        setArticles(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [q]);

  return (
    <div className="container-page py-12 md:py-16">
      <p className="text-xs font-sans font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">{t("common.search")}</p>
      <h1 className="font-display text-display-sm text-ink-900 dark:text-white mb-8">"{q}"</h1>
      {loading ? (
        <Spinner />
      ) : articles.length === 0 ? (
        <p className="text-ink-500 font-serif italic">{t("home.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}