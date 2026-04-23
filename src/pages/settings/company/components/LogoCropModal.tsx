/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { SyntheticEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import { getCroppedImg } from '../common/helpers/crop-image';
import 'react-image-crop/dist/ReactCrop.css';

interface Props {
  visible: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => Promise<void>;
}

export function LogoCropModal({
  visible,
  imageSrc,
  onClose,
  onCropComplete,
}: Props) {
  const [t] = useTranslation();

  const imgRef = useRef<HTMLImageElement>(null);

  const [crop, setCrop] = useState<Crop>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const getDefaultCrop = (width: number, height: number): Crop => {
    return centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, width / height, width, height),
      width,
      height
    );
  };

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = event.currentTarget;

    const defaultCrop = getDefaultCrop(width, height);

    setCrop(defaultCrop);
  };

  const handleReset = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;

      setCrop(getDefaultCrop(width, height));
      setCompletedCrop(undefined);
    }
  };

  const handleConfirm = () => {
    if (!completedCrop || !imgRef.current || isFormBusy) {
      return;
    }

    setIsFormBusy(true);

    getCroppedImg(imgRef.current, completedCrop)
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
        setCrop(undefined);
        setCompletedCrop(undefined);
        onClose();
      }}
      size="small"
      disableClosing={isFormBusy}
    >
      <div className="flex flex-col space-y-5">
        <div className="flex items-center justify-center w-full overflow-hidden">
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
