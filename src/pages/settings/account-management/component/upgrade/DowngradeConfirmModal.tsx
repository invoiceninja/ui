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
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DowngradeConfirmModal({ visible, onClose, onConfirm, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('downgrade_to_free')}
      visible={visible}
      onClose={onClose}
      size="small"
    >
      <div className="flex flex-col space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t('downgrade_end_of_cycle')}
          </p>
          
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-sm text-yellow-800">
                <strong>⚠️ {t('warning')}:</strong> {t('downgrade_to_free_description')}
            </p>
          </div>
        </div>

        <div className="flex space-x-3 justify-end">
          <Button
            behavior="button"
            type="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          
          <Button
            behavior="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? t('processing') : t('confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
} 