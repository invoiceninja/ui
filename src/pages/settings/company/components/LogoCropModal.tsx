/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, {
  Crop,
  convertToPixelCrop,
  PixelCrop,
} from 'react-image-crop';
import { useColorScheme } from '$app/common/colors';
import {
  compressCanvasToMaxSize,
  LOGO_MAX_DIMENSION,
} from '$app/common/helpers/logo-image';
import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { Spinner } from '$app/components/Spinner';
import 'react-image-crop/dist/ReactCrop.css';

interface Props {
  visible: boolean;
  imageSrc: string;
  isLoading?: boolean;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => Promise<void>;
}

const FULL_CROP: Crop = {
  unit: '%',
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};

const cropImageToBlob = async (
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<Blob> => {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const sourceX = Math.floor(crop.x * scaleX);
  const sourceY = Math.floor(crop.y * scaleY);
  const sourceWidth = Math.floor(crop.width * scaleX);
  const sourceHeight = Math.floor(crop.height * scaleY);

  let outputWidth = sourceWidth;

  let outputHeight = sourceHeight;

  if (outputWidth > LOGO_MAX_DIMENSION || outputHeight > LOGO_MAX_DIMENSION) {
    const ratio = Math.min(
      LOGO_MAX_DIMENSION / outputWidth,
      LOGO_MAX_DIMENSION / outputHeight
    );

    outputWidth = Math.floor(outputWidth * ratio);
    outputHeight = Math.floor(outputHeight * ratio);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return compressCanvasToMaxSize(canvas);
};

export function LogoCropModal({
  visible,
  imageSrc,
  isLoading = false,
  onClose,
  onCropComplete,
}: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const timeoutRef = useRef<NodeJS.Timeout>();
  const imgRef = useRef<HTMLImageElement>(null);

  const [crop, setCrop] = useState<Crop>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const handleImageLoad = () => {
    setCrop(FULL_CROP);

    timeoutRef.current = setTimeout(() => {
      if (imgRef.current) {
        const { width, height } = imgRef.current;

        setCompletedCrop(convertToPixelCrop(FULL_CROP, width, height));
      }
    }, 50);
  };

  const handleReset = () => {
    setCrop(FULL_CROP);

    if (imgRef.current) {
      const { width, height } = imgRef.current;

      setCompletedCrop(convertToPixelCrop(FULL_CROP, width, height));
    }
  };

  const handleConfirm = () => {
    if (!completedCrop || !imgRef.current || isFormBusy) {
      return;
    }

    setIsFormBusy(true);

    cropImageToBlob(imgRef.current, completedCrop)
      .then((croppedBlob) => onCropComplete(croppedBlob))
      .then(() => {
        setCrop(undefined);
        setCompletedCrop(undefined);
      })
      .finally(() => setIsFormBusy(false));
  };

  return (
    <Modal
      title={t('crop_logo')}
      visible={visible}
      onClose={() => {
        clearTimeout(timeoutRef.current);
        setCrop(undefined);
        setCompletedCrop(undefined);
        onClose();
      }}
      size="small"
      disableClosing={isFormBusy}
    >
      <div className="flex flex-col space-y-5">
        <div
          className="flex items-center justify-center w-full p-4 rounded-lg border"
          style={{
            backgroundColor: colors.$15,
            borderColor: colors.$24,
            minHeight: '18rem',
          }}
        >
          {isLoading || !imageSrc ? (
            <Spinner />
          ) : (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              keepSelection
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt={t('company_logo') ?? 'Company logo'}
                onLoad={handleImageLoad}
                style={{ maxHeight: '18rem', maxWidth: '100%' }}
              />
            </ReactCrop>
          )}
        </div>

        <div className="flex items-center justify-end pt-1 space-x-3">
          <Button
            behavior="button"
            type="secondary"
            onClick={handleReset}
            disabled={isFormBusy || isLoading || !imageSrc}
            disableWithoutIcon
          >
            {t('reset')}
          </Button>

          <Button
            behavior="button"
            onClick={handleConfirm}
            disabled={isFormBusy || isLoading || !completedCrop}
            disableWithoutIcon={!completedCrop || isLoading}
          >
            {t('upload')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
