import { useEffect, useState } from "react";
import { X, ImageIcon, Trash2, Upload, Check } from "lucide-react";
import { getImages, saveImage, deleteImage } from "../../lib/firestore";
import { uploadImage } from "../../lib/imageUpload";
import Button from "./Button";
import Spinner from "./Spinner";

export default function ImageLibraryPicker({ open, onClose, onSelect }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const imgs = await getImages();
      setImages(imgs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await uploadImage(file);
      const id = await saveImage(dataUrl, file.name);
      const newImg = { id, url: dataUrl, name: file.name };
      setImages((prev) => [newImg, ...prev]);
      setSelected(newImg);
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSelect = () => {
    if (selected) {
      onSelect(selected.url);
      onClose();
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar esta imagen de la biblioteca?")) return;
    try {
      await deleteImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface dark:bg-surface-dark rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ink-200 dark:border-ink-800">
          <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">
            Biblioteca de imágenes
          </h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload button */}
        <div className="p-4 border-b border-ink-200 dark:border-ink-800">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-ink-900 text-white dark:bg-white dark:text-ink-900 text-sm font-medium cursor-pointer hover:bg-ink-800 dark:hover:bg-ink-100 transition-colors">
            <Upload className="w-4 h-4" />
            {uploading ? "Subiendo..." : "Subir nueva imagen"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-2">
            Las imágenes se comprimen automáticamente (máx. 2400px, WebP/JPEG)
          </p>
        </div>

        {/* Image grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-12"><Spinner /></div>
          ) : images.length === 0 ? (
            <div className="py-12 text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-ink-300 dark:text-ink-600 mb-3" />
              <p className="text-ink-500 dark:text-ink-400 font-serif">No hay imágenes en la biblioteca.</p>
              <p className="text-sm text-ink-400 dark:text-ink-500 mt-1">Sube una para empezar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelected(img)}
                  className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                    selected?.id === img.id
                      ? "border-accent ring-2 ring-accent/30"
                      : "border-transparent hover:border-ink-300 dark:hover:border-ink-600"
                  }`}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" loading="lazy" />
                  {selected?.id === img.id && (
                    <div className="absolute top-1 right-1 bg-accent text-white rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <button
                    onClick={(e) => handleDelete(img.id, e)}
                    className="absolute bottom-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-ink-200 dark:border-ink-800">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSelect} disabled={!selected}>
            Seleccionar
          </Button>
        </div>
      </div>
    </div>
  );
}