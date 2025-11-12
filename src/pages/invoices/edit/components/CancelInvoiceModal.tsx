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
import { InputField } from '$app/components/forms/InputField';
import { Button } from '$app/components/forms/Button';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelInvoiceModal({ visible, onClose, onConfirm }: Props) {
  const [t] = useTranslation();
  const [cancellationReason, setCancellationReason] = useState('');

  const handleConfirm = () => {
    onConfirm(cancellationReason);
    setCancellationReason('');
  };

  const handleClose = () => {
    onClose();
    setCancellationReason('');
  };

  return (
    <Modal
    title="Rectificar factura"
    visible={visible}
      onClose={handleClose}
    >
      <InputField
        label="Motivo de la rectificación"
        value={cancellationReason}
        changeOverride={true}
        onValueChange={(value: string) => setCancellationReason(value)}
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
          disabled={!cancellationReason.trim()}
        >
          {t('confirm')}
        </Button>
      </div>
    </Modal>
  );
}
