import { useRef, useState } from "react";
import { Upload, X, ImageIcon, Library } from "lucide-react";
import { uploadImage } from "../../lib/imageUpload";
import ImageLibraryPicker from "./ImageLibraryPicker";

export default function ImageUploader({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await uploadImage(file);
      // Save to library and select
      const { saveImage } = await import("../../lib/firestore");
      await saveImage(dataUrl, file.name);
      onChange(dataUrl);
    } catch (err) {
      setError(err.message || "Error al subir la imagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleLibrarySelect = (url) => {
    onChange(url);
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-sans font-medium text-ink-700 dark:text-ink-300 mb-1.5">{label}</label>}
      {value ? (
        <div className="relative rounded-md overflow-hidden border border-ink-200 dark:border-ink-700">
          <img src={value} alt="Cover" className="w-full h-48 object-contain bg-ink-50 dark:bg-ink-900" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex-1 h-32 rounded-md border-2 border-dashed border-ink-300 dark:border-ink-600 flex flex-col items-center justify-center gap-2 text-ink-500 dark:text-ink-400 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="text-sm">Subiendo...</span>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">Subir imagen</span>
                <span className="text-xs">JPG, PNG, WebP</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            className="flex-1 h-32 rounded-md border-2 border-dashed border-ink-300 dark:border-ink-600 flex flex-col items-center justify-center gap-2 text-ink-500 dark:text-ink-400 hover:border-accent hover:text-accent transition-colors"
          >
            <Library className="w-6 h-6" />
            <span className="text-sm font-medium">Elegir de biblioteca</span>
            <span className="text-xs">Imágenes guardadas</span>
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        aria-label={label || "Upload image"}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}

      <ImageLibraryPicker
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={handleLibrarySelect}
      />
    </div>
  );
}