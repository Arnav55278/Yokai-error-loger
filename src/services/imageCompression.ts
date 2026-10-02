/**
 * WebP Compression Pipeline
 * Resizes images to max 1600px along longest edge, applies WebP 0.82 quality.
 * Reduces storage payload by ~75% while keeping diagrams and equations razor-sharp.
 */
export interface CompressedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  sizeKb: number;
  mimeType: string;
}

export async function compressImageToWebP(
  input: File | Blob | string,
  maxDimension: number = 1600,
  quality: number = 0.82
): Promise<CompressedImageResult> {
  let sourceUrl = "";
  let shouldRevoke = false;

  if (typeof input === "string") {
    sourceUrl = input;
  } else {
    sourceUrl = URL.createObjectURL(input);
    shouldRevoke = true;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Scale down if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Unable to create 2D canvas context for compression");
        }

        // High quality bicubic interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP
        let mimeType = "image/webp";
        let dataUrl = canvas.toDataURL(mimeType, quality);

        // Fallback to jpeg if browser doesn't support webp export
        if (!dataUrl.startsWith("data:image/webp")) {
          mimeType = "image/jpeg";
          dataUrl = canvas.toDataURL(mimeType, quality);
        }

        // Calculate size in KB
        const base64Length = dataUrl.length - (dataUrl.indexOf(",") + 1);
        const sizeBytes = Math.ceil((base64Length * 3) / 4);
        const sizeKb = Math.round(sizeBytes / 1024);

        if (shouldRevoke) {
          URL.revokeObjectURL(sourceUrl);
        }

        resolve({
          dataUrl,
          width,
          height,
          sizeKb,
          mimeType,
        });
      } catch (err) {
        if (shouldRevoke) {
          URL.revokeObjectURL(sourceUrl);
        }
        reject(err);
      }
    };

    img.onerror = (err) => {
      if (shouldRevoke) {
        URL.revokeObjectURL(sourceUrl);
      }
      reject(new Error("Failed to load image for compression: " + err));
    };

    img.src = sourceUrl;
  });
}
