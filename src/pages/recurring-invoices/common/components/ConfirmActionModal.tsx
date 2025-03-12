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
import { Button } from '$app/components/forms';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const confirmActionModalAtom = atom(false);

interface Props {
  onClick: () => void;
  onClose?: () => void;
  disabledButton?: boolean;
  title?: string | null;
  message?: string | null;
}

export function ConfirmActionModal({
  onClick,
  onClose,
  disabledButton,
  title,
  message,
}: Props) {
  const [t] = useTranslation();
  const [isModalVisible, setIsModalVisible] = useAtom(confirmActionModalAtom);

  useEffect(() => {
    return () => {
      setIsModalVisible(false);
    };
  }, []);

  return (
    <Modal
      title={title ?? t('are_you_sure')}
      visible={isModalVisible}
      onClose={() => {
        setIsModalVisible(false);
        onClose?.();
      }}
    >
      <div className="flex flex-col space-y-6">
        {Boolean(message) && (
          <span className="font-medium text-sm">{message}</span>
        )}

        <Button
          behavior="button"
          onClick={() => onClick()}
          disabled={disabledButton}
        >
          {t('continue')}
        </Button>
      </div>
    </Modal>
  );
}
