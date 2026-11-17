import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { createArticle, updateArticle, getArticle } from "../lib/firestore";
import AuthGuard from "../components/auth/AuthGuard";
import RichEditor from "../components/editor/RichEditor";
import Input from "../components/ui/Input";
import ImageUploader from "../components/ui/ImageUploader";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { slugify } from "../lib/slugify";

const DRAFT_KEY = "thevibeblog_draft";

function getDraftKey(id) {
  return id ? `${DRAFT_KEY}_${id}` : DRAFT_KEY;
}

function loadDraft(id) {
  try {
    const raw = localStorage.getItem(getDraftKey(id));
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveDraft(id, data) {
  try {
    localStorage.setItem(getDraftKey(id), JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch (e) {}
}

function clearDraft(id) {
  try {
    localStorage.removeItem(getDraftKey(id));
  } catch (e) {}
}

export default function Editor() {
  return (
    <AuthGuard requireWriter>
      <EditorInner />
    </AuthGuard>
  );
}

function EditorInner() {
  const { t } = useTranslation();
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);

  const saveTimer = useRef(null);

  // Load article or draft
  useEffect(() => {
    (async () => {
      try {
        if (isEdit) {
          const a = await getArticle(id);
          if (a) {
            // Check for saved draft first
            const draft = loadDraft(id);
            if (draft && draft.savedAt > (a.updatedAt?.toMillis?.() || 0)) {
              setTitle(draft.title ?? a.title ?? "");
              setSubtitle(draft.subtitle ?? a.subtitle ?? "");
              setContent(draft.content ?? a.content ?? "");
              setTags(draft.tags ?? (a.tags || []).join(", "));
              setCoverImage(draft.coverImage ?? a.coverImage ?? "");
              setStatus(draft.status ?? a.status ?? "draft");
              setDraftRestored(true);
            } else {
              setTitle(a.title || "");
              setSubtitle(a.subtitle || "");
              setContent(a.content || "");
              setTags((a.tags || []).join(", "));
              setCoverImage(a.coverImage || "");
              setStatus(a.status || "draft");
            }
          }
        } else {
          // New article: check for saved draft
          const draft = loadDraft(null);
          if (draft) {
            setTitle(draft.title || "");
            setSubtitle(draft.subtitle || "");
            setContent(draft.content || "");
            setTags(draft.tags || "");
            setCoverImage(draft.coverImage || "");
            setStatus(draft.status || "draft");
            setDraftRestored(true);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  // Auto-save draft to localStorage (debounced)
  useEffect(() => {
    if (loading) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveDraft(id, {
        title,
        subtitle,
        content,
        tags,
        coverImage,
        status,
      });
      setLastSaved(new Date());
    }, 1000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, subtitle, content, tags, coverImage, status, loading, id]);

  const handleSave = async (publish = false) => {
    if (!title.trim()) return;
    // Only admins can publish
    if (publish && !isAdmin) {
      alert("Solo un administrador puede publicar artículos.");
      return;
    }
    // Client-side validation
    if (title.trim().length > 200) {
      alert("El título es demasiado largo (máx. 200 caracteres).");
      return;
    }
    if (content.length > 100000) {
      alert("El contenido es demasiado largo.");
      return;
    }
    setSaving(true);
    const finalStatus = (publish && isAdmin) ? "published" : "draft";
    const slug = slugify(title) + "-" + Date.now().toString(36);
    const data = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      content,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverImage: coverImage.trim(),
      status: finalStatus,
      authorId: user.uid,
      authorName: profile?.displayName || user.displayName,
      authorPhoto: profile?.photoURL || user.photoURL || "",
      slug: isEdit ? undefined : slug,
    };
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

    try {
      if (isEdit) {
        await updateArticle(id, data);
        clearDraft(id);
        if (finalStatus === "published") {
          const updated = await getArticle(id);
          navigate(`/article/${updated.slug}`);
        } else {
          setSaveMsg("Borrador guardado correctamente.");
          setTimeout(() => setSaveMsg(null), 3000);
        }
      } else {
        const newSlug = slug;
        await createArticle({ ...data, slug: newSlug });
        clearDraft(null);
        if (finalStatus === "published") {
          navigate(`/article/${newSlug}`);
        } else {
          // Stay on page, reset for new article
          setTitle("");
          setSubtitle("");
          setContent("");
          setTags("");
          setCoverImage("");
          setStatus("draft");
          setSaveMsg("Borrador guardado correctamente.");
          setTimeout(() => setSaveMsg(null), 3000);
        }
      }
    } catch (e) {
      console.error(e);
      setSaveMsg("Error al guardar.");
      setTimeout(() => setSaveMsg(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const discardDraft = () => {
    clearDraft(id);
    setDraftRestored(false);
    // Reload original if editing
    if (isEdit) {
      (async () => {
        const a = await getArticle(id);
        if (a) {
          setTitle(a.title || "");
          setSubtitle(a.subtitle || "");
          setContent(a.content || "");
          setTags((a.tags || []).join(", "));
          setCoverImage(a.coverImage || "");
          setStatus(a.status || "draft");
        }
      })();
    } else {
      setTitle("");
      setSubtitle("");
      setContent("");
      setTags("");
      setCoverImage("");
      setStatus("draft");
    }
  };

  if (loading) return <div className="py-32"><Spinner /></div>;

  return (
    <div className="max-w-article mx-auto px-6 md:px-8 py-12 md:py-16">
      {draftRestored && (
        <div className="mb-6 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-center justify-between gap-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Borrador restaurado automáticamente.
          </p>
          <button
            onClick={discardDraft}
            className="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:underline"
          >
            Descartar
          </button>
        </div>
      )}

      <p className="text-xs font-sans font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-4">
        {isEdit ? t("article.edit") : t("nav.write")}
      </p>
      <h1 className="font-display text-display-sm text-ink-900 dark:text-white mb-8">
        {title || t("editor.title")}
      </h1>

      <div className="space-y-4 mb-8">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("editor.title")}
          className="text-2xl font-display"
        />
        <Input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder={t("editor.subtitle")}
        />
        <ImageUploader
          value={coverImage}
          onChange={setCoverImage}
          label={t("editor.coverImage")}
        />
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder={t("editor.tags")}
        />
        {isAdmin && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-sans font-medium text-ink-700 dark:text-ink-300">{t("editor.status")}:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-md border border-ink-300 dark:border-ink-600 bg-white dark:bg-ink-900 text-ink-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="draft">{t("editor.draft")}</option>
              <option value="published">{t("editor.published")}</option>
            </select>
          </div>
        )}
        {!isAdmin && (
          <p className="text-sm text-ink-500 dark:text-ink-400 italic">
            Tu artículo se guardará como borrador y necesitará aprobación de un administrador para publicarse.
          </p>
        )}
      </div>

      <RichEditor content={content} onChange={setContent} placeholder={t("editor.content")} />

      <div className="mt-8 flex items-center justify-between gap-3">
        <div className="text-xs text-ink-400 dark:text-ink-500">
          {lastSaved && `Guardado automáticamente ${lastSaved.toLocaleTimeString()}`}
          {saveMsg && <span className="ml-3 text-green-600 dark:text-green-400">{saveMsg}</span>}
        </div>
        <div className="flex gap-3">
          <Button onClick={() => handleSave(false)} disabled={saving} variant="secondary">
            {saving ? "..." : t("editor.saveDraft")}
          </Button>
          {isAdmin && (
            <Button onClick={() => handleSave(true)} disabled={saving}>
              {saving ? "..." : t("editor.publish")}
            </Button>
          )}
          {!isAdmin && (
            <p className="text-xs text-ink-500 dark:text-ink-400 self-center">
              Solo un administrador puede publicar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}