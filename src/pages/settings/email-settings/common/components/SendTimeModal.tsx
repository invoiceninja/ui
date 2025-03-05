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
import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Element } from '$app/components/cards';
interface SendTimeModalProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onConfirm: (syncEnabled: boolean) => void;
}

export function SendTimeModal({
  visible,
  setVisible,
  onConfirm,
}: SendTimeModalProps) {
  const [t] = useTranslation();

  const [syncEnabled, setSyncEnabled] = useState<boolean>(false);

  const handleOnClose = () => {
    setSyncEnabled(false);
    setVisible(false);
  };

  return (
    <Modal title={t('send_time')} visible={visible} onClose={handleOnClose}>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <Element
            leftSide={t('sync_send_time')}
            noExternalPadding
            noVerticalPadding
            withoutWrappingLeftSide
          >
            <Toggle
              checked={syncEnabled}
              onChange={() => setSyncEnabled(!syncEnabled)}
            />
          </Element>

          <span className="text-sm text-gray-500">
            {t('sync_send_time_help')}
          </span>
        </div>

        <Button
          behavior="button"
          onClick={() => {
            onConfirm(syncEnabled);
            handleOnClose();
          }}
        >
          {t('confirm')}
        </Button>
      </div>
    </Modal>
  );
}
