import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { getAllUsers, updateUserRole, getAllArticlesAdmin, setArticleStatus, deleteArticle, getComments, deleteComment } from "../lib/firestore";
import AuthGuard from "../components/auth/AuthGuard";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { Link } from "react-router-dom";
import { Users, FileText, MessageCircle, Shield, Trash2, Edit, UserCog } from "lucide-react";

export default function Admin() {
  return (
    <AuthGuard requireAdmin>
      <AdminInner />
    </AuthGuard>
  );
}

function AdminInner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const u = await getAllUsers();
      setUsers(u || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const a = await getAllArticlesAdmin(200);
      setArticles(a || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (articleId) => {
    setLoadingComments(true);
    try {
      const c = await getComments(articleId);
      setComments(c || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (tab === "users") loadUsers();
    else if (tab === "articles") loadArticles();
  }, [tab]);

  const handleRoleChange = async (uid, newRole) => {
    if (uid === user.uid) {
      alert("You cannot change your own role.");
      return;
    }
    try {
      await updateUserRole(uid, newRole);
      setUsers((prev) => prev.map((u) => (u.id === uid || u.uid === uid ? { ...u, role: newRole } : u)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await setArticleStatus(id, newStatus);
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Delete this article permanently?")) return;
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      if (selectedArticle?.id === id) setSelectedArticle(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    loadComments(article.id);
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedArticle) return;
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(selectedArticle.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) {
      console.error(e);
    }
  };

  const roleColor = (role) => {
    if (role === "admin") return "text-red-600 dark:text-red-400";
    if (role === "writer") return "text-blue-600 dark:text-blue-400";
    return "text-ink-500 dark:text-ink-400";
  };

  return (
    <div className="container-page py-12 md:py-16">
      <p className="text-xs font-sans font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">
        Admin
      </p>
      <h1 className="font-display text-display-sm text-ink-900 dark:text-white mb-8">
        Admin Panel
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-ink-200 dark:border-ink-800">
        {[
          { key: "users", label: "Users", icon: Users },
          { key: "articles", label: "Articles", icon: FileText },
          { key: "comments", label: "Comments", icon: MessageCircle },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSelectedArticle(null); setComments([]); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-sans font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? "border-ink-900 dark:border-white text-ink-900 dark:text-white"
                : "border-transparent text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {loading && tab !== "comments" ? (
        <Spinner />
      ) : (
        <>
          {/* Users tab */}
          {tab === "users" && (
            <div>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">{users.length} users</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 dark:border-ink-800 text-left">
                      <th className="py-3 pr-4 font-sans font-semibold text-ink-700 dark:text-ink-300">User</th>
                      <th className="py-3 pr-4 font-sans font-semibold text-ink-700 dark:text-ink-300">Email</th>
                      <th className="py-3 pr-4 font-sans font-semibold text-ink-700 dark:text-ink-300">Role</th>
                      <th className="py-3 font-sans font-semibold text-ink-700 dark:text-ink-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const uid = u.id || u.uid;
                      const isSelf = uid === user.uid;
                      return (
                        <tr key={uid} className="border-b border-ink-100 dark:border-ink-800/50">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              {u.photoURL ? (
                                <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-ink-200 dark:bg-ink-700 flex items-center justify-center">
                                  <span className="text-xs font-display">{u.displayName?.[0]}</span>
                                </div>
                              )}
                              <span className="font-medium text-ink-900 dark:text-white">{u.displayName}</span>
                              {isSelf && <span className="text-xs text-ink-400">(you)</span>}
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-ink-600 dark:text-ink-400">{u.email}</td>
                          <td className="py-3 pr-4">
                            <span className={`font-sans font-semibold capitalize ${roleColor(u.role)}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3">
                            {!isSelf && (
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(uid, e.target.value)}
                                className="px-2 py-1 rounded-md border border-ink-300 dark:border-ink-600 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                              >
                                <option value="reader">Reader</option>
                                <option value="writer">Writer</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Articles tab */}
          {tab === "articles" && (
            <div>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">{articles.length} articles</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 dark:border-ink-800 text-left">
                      <th className="py-3 pr-4 font-sans font-semibold text-ink-700 dark:text-ink-300">Title</th>
                      <th className="py-3 pr-4 font-sans font-semibold text-ink-700 dark:text-ink-300">Author</th>
                      <th className="py-3 pr-4 font-sans font-semibold text-ink-700 dark:text-ink-300">Status</th>
                      <th className="py-3 font-sans font-semibold text-ink-700 dark:text-ink-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((a) => (
                      <tr key={a.id} className="border-b border-ink-100 dark:border-ink-800/50">
                        <td className="py-3 pr-4">
                          <Link to={`/article/${a.slug}`} className="font-medium text-ink-900 dark:text-white hover:text-accent transition-colors">
                            {a.title}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-ink-600 dark:text-ink-400">{a.authorName}</td>
                        <td className="py-3 pr-4">
                          <select
                            value={a.status}
                            onChange={(e) => handleStatusChange(a.id, e.target.value)}
                            className="px-2 py-1 rounded-md border border-ink-300 dark:border-ink-600 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                        </td>
                        <td className="py-3 flex gap-2">
                          <Link to={`/edit/${a.id}`}>
                            <Button size="sm" variant="secondary"><Edit className="w-3.5 h-3.5" /></Button>
                          </Link>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteArticle(a.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleSelectArticle(a)}>
                            <MessageCircle className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Comments panel for selected article */}
              {selectedArticle && (
                <div className="mt-8 p-6 rounded-md border border-ink-200 dark:border-ink-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">
                      Comments on "{selectedArticle.title}"
                    </h3>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedArticle(null); setComments([]); }}>
                      Close
                    </Button>
                  </div>
                  {loadingComments ? (
                    <Spinner />
                  ) : comments.length === 0 ? (
                    <p className="text-ink-500 font-serif italic">No comments.</p>
                  ) : (
                    <ul className="space-y-4">
                      {comments.map((c) => (
                        <li key={c.id} className="flex items-start gap-3 p-3 rounded-md bg-ink-50 dark:bg-ink-900">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-sans font-semibold text-ink-900 dark:text-white">{c.authorName}</p>
                            <p className="text-sm text-ink-700 dark:text-ink-300 font-serif mt-1">{c.content}</p>
                          </div>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteComment(c.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Comments tab */}
          {tab === "comments" && (
            <div>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">
                Select an article from the Articles tab to manage its comments.
              </p>
              <Button onClick={() => setTab("articles")} variant="secondary">
                Go to Articles
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}