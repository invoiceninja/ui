/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import { InputField } from '$app/components/forms/InputField';
import { MdOutlineWarning, MdWarning } from 'react-icons/md';
import { Icon } from '$app/components/icons/Icon';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RectifyInvoiceModal({ visible, onClose, onConfirm }: Props) {
  const [t] = useTranslation();
  const [rectificationReason, setRectificationReason] = useState('');

  const handleConfirm = () => {
    onConfirm(rectificationReason);
    setRectificationReason('');
  };

  const handleClose = () => {
    onClose();
    setRectificationReason('');
  };

  return (
    <Modal
      title="Rectificar factura"
      visible={visible}
      onClose={handleClose}
    >
      <div className="flex items-center">
        <Icon element={MdWarning} color="orange" size={48} />
        <span className="font-medium text-sm ml-2 text-orange-500">Esto le permitirá crear una factura rectificativa parcial por una parte del importe de la factura.</span>
      </div>
      <InputField
        label="Motivo de la rectificación"
        value={rectificationReason}
        changeOverride={true}
        onValueChange={(value: string) => setRectificationReason(value)}
        required
      />
      <div className="flex justify-end space-x-2 mt-4">
        <Button
          type="secondary"
          onClick={handleClose}
        >
          {t('cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!rectificationReason.trim()}
        >
          {t('confirm')}
        </Button>
      </div>
    </Modal>
  );
}

