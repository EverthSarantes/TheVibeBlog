// Image upload utility: compresses an image file to a base64 data URL.
// Works without Firebase Storage — images are stored as base64 in Firestore.
// Firebase Storage is optional; if configured, this can be swapped for a Storage upload.

const MAX_WIDTH = 2400;
const MAX_HEIGHT = 2400;
const QUALITY = 0.85;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function supportsWebP() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch (e) {
    return false;
  }
}

export function fileToCompressedBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Not an image file"));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      reject(new Error("Image too large (max 10 MB)"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Don't upscale small images
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        // Use high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const format = supportsWebP() ? "image/webp" : "image/jpeg";
        const dataUrl = canvas.toDataURL(format, QUALITY);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// Returns a promise that resolves to a base64 data URL string.
export async function uploadImage(file) {
  return fileToCompressedBase64(file);
}