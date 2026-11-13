import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { createArticle, updateArticle, getArticle } from "../lib/firestore";
import AuthGuard from "../components/auth/AuthGuard";
import RichEditor from "../components/editor/RichEditor";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
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
        const a = await getArticle(id);
        if (a) {
          setTitle(a.title || "");
          setSubtitle(a.subtitle || "");
          setContent(a.content || "");
          setTags((a.tags || []).join(", "));
          setCoverImage(a.coverImage || "");
          setStatus(a.status || "draft");
        }
        setLoading(false);
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
    // remove undefined
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

    if (isEdit) {
      await updateArticle(id, data);
      const updated = await getArticle(id);
      navigate(`/article/${updated.slug}`);
    } else {
      const newSlug = slug;
      await createArticle({ ...data, slug: newSlug });
      navigate(`/article/${newSlug}`);
    }
    setSaving(false);
  };

  if (loading) return <div className="py-20"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">{isEdit ? t("article.edit") : t("nav.write")}</h1>

      <div className="space-y-4 mb-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("editor.title")}
          className="text-2xl font-bold"
        />
        <Input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder={t("editor.subtitle")}
        />
        <Input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder={t("editor.coverImage")}
        />
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder={t("editor.tags")}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">{t("editor.status")}:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          >
            <option value="draft">{t("editor.draft")}</option>
            <option value="published">{t("editor.published")}</option>
          </select>
        </div>
      </div>

      <RichEditor content={content} onChange={setContent} placeholder={t("editor.content")} />

      <div className="mt-6 flex gap-3">
        <Button onClick={() => handleSave(false)} disabled={saving}>
          {saving ? "..." : t("editor.saveDraft")}
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving}>
          {saving ? "..." : t("editor.publish")}
        </Button>
      </div>
    </div>
  );
}