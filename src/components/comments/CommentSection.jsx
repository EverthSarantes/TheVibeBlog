import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { getComments, addComment, deleteComment } from "../../lib/firestore";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import { Trash2, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { es as esLocale } from "date-fns/locale";

export default function CommentSection({ articleId }) {
  const { t } = useTranslation();
  const { user, profile, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const c = await getComments(articleId);
      setComments(c || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [articleId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await addComment(articleId, {
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName,
        authorPhoto: profile?.photoURL || user.photoURL,
        content: text.trim(),
      });
      setText("");
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar comentario?")) return;
    await deleteComment(articleId, id);
    await load();
  };

  return (
    <section className="mt-16 pt-12 border-t border-ink-200 dark:border-ink-800">
      <h3 className="font-display text-2xl font-bold mb-8 flex items-center gap-2 text-ink-900 dark:text-white">
        <MessageCircle className="w-5 h-5" /> {t("article.comments")} ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={submit} className="mb-10">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("comments.placeholder")}
            aria-label={t("comments.placeholder")}
            rows={3}
          />
          <div className="mt-3 flex justify-end">
            <Button type="submit" disabled={submitting || !text.trim()}>
              {submitting ? "..." : t("comments.submit")}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mb-8 text-ink-500 font-serif italic">{t("comments.loginToComment")}</p>
      )}

      {loading ? (
        <p className="text-ink-500">{t("common.loading")}</p>
      ) : comments.length === 0 ? (
        <p className="text-ink-500 font-serif italic">{t("comments.empty")}</p>
      ) : (
        <ul className="space-y-8">
          {comments.map((c) => {
            const date = c.createdAt?.toDate ? c.createdAt.toDate() : (c.createdAt ? new Date(c.createdAt) : null);
            const canDelete = user && (user.uid === c.authorId || isAdmin);
            return (
              <li key={c.id} className="flex gap-4">
                {c.authorPhoto ? (
                  <img src={c.authorPhoto} alt="" className="w-10 h-10 rounded-full ring-1 ring-ink-200 dark:ring-ink-700 flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-ink-200 dark:bg-ink-700 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-sm text-ink-600 dark:text-ink-300">{c.authorName?.[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans font-semibold text-sm text-ink-900 dark:text-white">{c.authorName}</span>
                    {date && <span className="text-xs text-ink-400">{format(date, "d MMM, yyyy", { locale: esLocale })}</span>}
                    {canDelete && (
                      <button onClick={() => remove(c.id)} className="ml-auto text-ink-400 hover:text-red-600 transition-colors" aria-label="delete comment">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-ink-700 dark:text-ink-300 font-serif leading-relaxed whitespace-pre-wrap">{c.content}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}