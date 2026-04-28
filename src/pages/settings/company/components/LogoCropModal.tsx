/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, {
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface Props {
  visible: boolean;
  imageSrc: string;
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

const cropImageToBlob = (
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<Blob> => {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('No 2d context'));
  }

  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);

  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    Math.floor(crop.x * scaleX),
    Math.floor(crop.y * scaleY),
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas toBlob failed'));
      }
    }, 'image/png');
  });
};

export function LogoCropModal({
  visible,
  imageSrc,
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
          style={{ backgroundColor: colors.$15, borderColor: colors.$24 }}
        >
          {imageSrc && (
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
            disabled={isFormBusy}
            disableWithoutIcon
          >
            {t('reset')}
          </Button>

          <Button
            behavior="button"
            onClick={handleConfirm}
            disabled={isFormBusy || !completedCrop}
            disableWithoutIcon={!completedCrop}
          >
            {t('upload')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
