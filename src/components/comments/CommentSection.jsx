import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { getComments, addComment, deleteComment } from "../../lib/firestore";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import { Trash2, MessageCircle } from "lucide-react";
import { format } from "date-fns";

export default function CommentSection({ articleId }) {
  const { t } = useTranslation();
  const { user, profile, isWriter, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const c = await getComments(articleId);
    setComments(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, [articleId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    await addComment(articleId, {
      authorId: user.uid,
      authorName: profile?.displayName || user.displayName,
      authorPhoto: profile?.photoURL || user.photoURL,
      content: text.trim(),
    });
    setText("");
    await load();
    setSubmitting(false);
  };

  const remove = async (id, authorId) => {
    if (!window.confirm("Delete comment?")) return;
    await deleteComment(articleId, id);
    await load();
  };

  return (
    <section className="mt-12">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" /> {t("article.comments")} ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={submit} className="mb-8">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("comments.placeholder")}
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" disabled={submitting || !text.trim()}>
              {submitting ? "..." : t("comments.submit")}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-gray-500">{t("comments.loginToComment")}</p>
      )}

      {loading ? (
        <p className="text-gray-500">{t("common.loading")}</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">{t("comments.empty")}</p>
      ) : (
        <ul className="space-y-6">
          {comments.map((c) => {
            const date = c.createdAt?.toDate ? c.createdAt.toDate() : (c.createdAt ? new Date(c.createdAt) : null);
            const canDelete = user && (user.uid === c.authorId || isAdmin);
            return (
              <li key={c.id} className="flex gap-3">
                {c.authorPhoto ? (
                  <img src={c.authorPhoto} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{c.authorName}</span>
                    {date && <span className="text-xs text-gray-500">{format(date, "MMM d, yyyy")}</span>}
                    {canDelete && (
                      <button onClick={() => remove(c.id, c.authorId)} className="ml-auto text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{c.content}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}