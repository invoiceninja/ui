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
import { Button, SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedUserCount: number) => void;
  currentUserCount: number;
  isLoading?: boolean;
}

export function ChangeDocuNinjaPlanModal({ 
  visible, 
  onClose, 
  onConfirm, 
  currentUserCount, 
  isLoading 
}: Props) {
  const { t } = useTranslation();
  const [selectedUserCount, setSelectedUserCount] = useState<number>(currentUserCount);

  // Reset selected user count when modal opens or currentUserCount changes
  useEffect(() => {
    if (visible) {
      setSelectedUserCount(currentUserCount);
    }
  }, [visible, currentUserCount]);

  // Generate options from current count down to 0
  const userCountOptions = Array.from({ length: currentUserCount + 1 }, (_, i) => ({
    value: currentUserCount - i,
    label: currentUserCount - i === 0 
      ? `0 ${t('users')} (${t('disable_docuninja')})` 
      : `${currentUserCount - i} ${t('users')}`
  }));

  const handleConfirm = () => {
    onConfirm(selectedUserCount);
  };

  const isPlanChanging = selectedUserCount !== currentUserCount;

  return (
    <Modal
      title={t('change_plan')}
      visible={visible}
      onClose={onClose}
      size="small"
    >
      <div className="flex flex-col space-y-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {`${t('docuninja')} ${t('users')}`}: <strong>{currentUserCount}</strong>
            </p>
          </div>

          <SelectField
            label={t('docuninja_change_users')}
            value={selectedUserCount.toString()}
            onValueChange={(value) => setSelectedUserCount(parseInt(value))}
          >
            {userCountOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          {selectedUserCount === 0 && (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-sm text-red-800">
                <strong>⚠️ {t('warning')}:</strong> {t('docuninja_disable_warning')}
              </p>
            </div>
          )}

          {selectedUserCount < currentUserCount && selectedUserCount > 0 && (
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>ℹ️ {t('info')}:</strong> {t('docuninja_downgrade_info')}
              </p>
            </div>
          )}
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
          
          {isPlanChanging && (
            <Button
              behavior="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={selectedUserCount === 0 ? "bg-red-600 hover:bg-red-700" : undefined}
            >
              {isLoading 
                ? t('processing') 
                  : t('confirm')
              }
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
} 