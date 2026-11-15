import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { uploadImage } from "../../lib/imageUpload";

export default function ImageUploader({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await uploadImage(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err.message || "Error al subir la imagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
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
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-md border-2 border-dashed border-ink-300 dark:border-ink-600 flex flex-col items-center justify-center gap-2 text-ink-500 dark:text-ink-400 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-sm">Subiendo...</span>
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-sm font-medium">Seleccionar imagen</span>
              <span className="text-xs">JPG, PNG, WebP (máx. 2400px)</span>
            </>
          )}
        </button>
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
    </div>
  );
}