/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export function compressImage(
  dataUrl: string,
  maxWidth: number = 800,
  maxHeight: number = 400,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL('image/jpeg', quality);

      resolve(compressed);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = dataUrl;
  });
}

export function compressSignature(dataUrl: string): Promise<string> {
  return compressImage(dataUrl, 600, 200, 0.7);
}

export function compressInitials(dataUrl: string): Promise<string> {
  return compressImage(dataUrl, 200, 150, 0.7);
}

/** Ceiling for a base64 image stored in TipTap HTML, including the data-URL prefix. */
export const MAX_STORED_IMAGE_BYTES = 32 * 1024;

export function storedImageBytes(dataUrl: string): number {
  return new TextEncoder().encode(dataUrl).byteLength;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error('Failed to load image for compression'));
    image.src = dataUrl;
  });
}

function encodeJpeg(
  image: HTMLImageElement,
  maxEdge: number,
  quality: number
): string {
  let { width, height } = image;
  const longest = Math.max(width, height);

  if (longest > maxEdge) {
    const scale = maxEdge / longest;
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Keep an already-small data URL. Otherwise re-encode as JPEG, lowering
 * quality and then dimensions, until the stored string is within maxBytes.
 */
export async function compressImageToMaxBytes(
  dataUrl: string,
  maxBytes: number = MAX_STORED_IMAGE_BYTES
): Promise<string> {
  if (storedImageBytes(dataUrl) <= maxBytes) {
    return dataUrl;
  }

  const image = await loadImage(dataUrl);
  let maxEdge = Math.min(Math.max(image.width, image.height), 1600);
  const qualities = [0.8, 0.6, 0.45, 0.3, 0.2];

  while (maxEdge >= 16) {
    for (const quality of qualities) {
      const encoded = encodeJpeg(image, maxEdge, quality);

      if (storedImageBytes(encoded) <= maxBytes) {
        return encoded;
      }
    }

    const nextEdge = Math.round(maxEdge * 0.75);
    if (nextEdge >= maxEdge) break;
    maxEdge = nextEdge;
  }

  throw new Error('Image could not be reduced below the storage limit');
}
