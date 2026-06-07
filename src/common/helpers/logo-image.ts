/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const LOGO_MAX_DIMENSION = 800;
export const LOGO_MAX_BLOB_SIZE = 2 * 1024 * 1024;

export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('Converting canvas to blob failed')),
      type,
      quality
    );
  });

export const compressCanvasToMaxSize = async (
  canvas: HTMLCanvasElement,
  preferredType: 'image/png' | 'image/jpeg' = 'image/png'
): Promise<Blob> => {
  if (preferredType === 'image/png') {
    const pngBlob = await canvasToBlob(canvas, 'image/png');

    if (pngBlob.size <= LOGO_MAX_BLOB_SIZE) {
      return pngBlob;
    }
  }

  let quality = 0.9;

  while (quality >= 0.1) {
    const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', quality);

    if (jpegBlob.size <= LOGO_MAX_BLOB_SIZE) {
      return jpegBlob;
    }

    quality -= 0.1;
  }

  return canvasToBlob(canvas, 'image/jpeg', 0.1);
};

const loadImageFromFile = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    image.src = objectUrl;
  });

const drawImageToCanvas = (
  image: HTMLImageElement
): { canvas: HTMLCanvasElement; isOpaque: boolean } => {
  let outputWidth = image.naturalWidth;
  let outputHeight = image.naturalHeight;

  if (outputWidth > LOGO_MAX_DIMENSION || outputHeight > LOGO_MAX_DIMENSION) {
    const ratio = Math.min(
      LOGO_MAX_DIMENSION / outputWidth,
      LOGO_MAX_DIMENSION / outputHeight
    );

    outputWidth = Math.max(1, Math.floor(outputWidth * ratio));
    outputHeight = Math.max(1, Math.floor(outputHeight * ratio));
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(image, 0, 0, outputWidth, outputHeight);

  return { canvas, isOpaque: false };
};

const blobToFile = (blob: Blob, originalName: string): File => {
  const extension = blob.type === 'image/jpeg' ? 'jpg' : 'png';

  const baseName = originalName.replace(/\.[^/.]+$/, '') || 'company_logo';

  return new File([blob], `${baseName}.${extension}`, {
    type: blob.type,
    lastModified: Date.now(),
  });
};

export const compressImageFileForLogo = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const isWithinSize = file.size <= LOGO_MAX_BLOB_SIZE;

  const image = await loadImageFromFile(file);

  try {
    const needsResize =
      image.naturalWidth > LOGO_MAX_DIMENSION ||
      image.naturalHeight > LOGO_MAX_DIMENSION;

    if (isWithinSize && !needsResize) {
      return file;
    }

    const { canvas } = drawImageToCanvas(image);

    const preferredType: 'image/png' | 'image/jpeg' =
      file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';

    const compressedBlob = await compressCanvasToMaxSize(canvas, preferredType);

    return blobToFile(compressedBlob, file.name);
  } finally {
    URL.revokeObjectURL(image.src);
  }
};
