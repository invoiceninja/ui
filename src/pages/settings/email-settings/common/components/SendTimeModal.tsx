/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Modal } from '$app/components/Modal';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';
import { Button } from '$app/components/forms';
interface SendTimeModalProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
}

export function SendTimeModal({
  visible,
  setVisible,
  onConfirm,
}: SendTimeModalProps) {
  const [t] = useTranslation();

  return (
    <Modal
      title={t('send_time')}
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <span className="font-medium">{t('sync_send_time')}</span>

      <Button
        behavior="button"
        onClick={() => {
          onConfirm();
          setVisible(false);
        }}
      >
        {t('yes')}
      </Button>
    </Modal>
  );
}
