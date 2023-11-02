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
}

export function ConfirmActionModal({ onClick }: Props) {
  const [t] = useTranslation();
  const [isModalVisible, setIsModalVisible] = useAtom(confirmActionModalAtom);

  useEffect(() => {
    return () => {
      setIsModalVisible(false);
    };
  }, []);

  return (
    <Modal
      title={t('are_you_sure')}
      visible={isModalVisible}
      onClose={() => setIsModalVisible(false)}
    >
      <Button onClick={() => onClick()}>{t('continue')}</Button>
    </Modal>
  );
}
