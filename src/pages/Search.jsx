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
      const all = await getArticles({ max: 100 });
      const lower = q.toLowerCase();
      const filtered = all.filter((a) =>
        a.title?.toLowerCase().includes(lower) ||
        a.subtitle?.toLowerCase().includes(lower) ||
        a.content?.toLowerCase().includes(lower) ||
        a.tags?.some((tag) => tag.toLowerCase().includes(lower))
      );
      setArticles(filtered);
      setLoading(false);
    })();
  }, [q]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">{t("common.search")}: "{q}"</h1>
      {loading ? (
        <Spinner />
      ) : articles.length === 0 ? (
        <p className="text-gray-500">{t("home.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}