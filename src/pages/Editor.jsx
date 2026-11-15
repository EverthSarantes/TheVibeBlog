import { useEffect, useState } from "react";
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

export default function Editor() {
  return (
    <AuthGuard requireWriter>
      <EditorInner />
    </AuthGuard>
  );
}

function EditorInner() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
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

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const a = await getArticle(id);
          if (a) {
            setTitle(a.title || "");
            setSubtitle(a.subtitle || "");
            setContent(a.content || "");
            setTags((a.tags || []).join(", "));
            setCoverImage(a.coverImage || "");
            setStatus(a.status || "draft");
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, isEdit]);

  const handleSave = async (publish = false) => {
    if (!title.trim()) return;
    setSaving(true);
    const finalStatus = publish ? "published" : status;
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
        const updated = await getArticle(id);
        navigate(`/article/${updated.slug}`);
      } else {
        const newSlug = slug;
        await createArticle({ ...data, slug: newSlug });
        navigate(`/article/${newSlug}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-32"><Spinner /></div>;

  return (
    <div className="max-w-article mx-auto px-6 md:px-8 py-12 md:py-16">
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
      </div>

      <RichEditor content={content} onChange={setContent} placeholder={t("editor.content")} />

      <div className="mt-8 flex gap-3">
        <Button onClick={() => handleSave(false)} disabled={saving} variant="secondary">
          {saving ? "..." : t("editor.saveDraft")}
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving}>
          {saving ? "..." : t("editor.publish")}
        </Button>
      </div>
    </div>
  );
}