/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo, useState } from 'react';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Element } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { AxiosError } from 'axios';

interface EntityConfig {
  key: string;
  label: string;
  description?: string;
}

interface QBOUpdatesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function QBOUpdatesModal({ visible, onClose }: QBOUpdatesModalProps) {
  const [t] = useTranslation();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [selectedEntities, setSelectedEntities] = useState<
    Record<string, boolean>
  >({
    invoices: false,
    quotes: false,
    payments: false,
    products: false,
  });

  const handleToggleEntity = (key: string, value: boolean) => {
    setSelectedEntities((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const payload: Record<string, boolean> = {};

    Object.entries(selectedEntities).forEach(([key, value]) => {
      payload[key] = value;
    });

    setIsFormBusy(true);

    request('POST', endpoint('/api/v1/quickbooks/sync'), payload)
      .then(() => {
        toast.success('sync_started');

        onClose();
      })
      .catch((error: AxiosError) => {
        console.error(error);
        toast.error();
      })
      .finally(() => setIsFormBusy(false));
  };

  const ENTITY_CONFIGS: EntityConfig[] = useMemo(
    () => [
      {
        key: 'invoices',
        label: t('invoices'),
        description: `${t('sent')}, ${t('updated')}, ${t('paid')}`,
      },
      {
        key: 'quotes',
        label: t('quotes'),
        description: `${t('sent')}, ${t('approved')}, ${t('rejected')}`,
      },
      {
        key: 'payments',
        label: t('payments'),
      },
      {
        key: 'products',
        label: t('products'),
        description: `${t('created')}, ${t('updated')}`,
      },
    ],
    []
  );

  return (
    <Modal title={t('qbo_updates')} visible={visible} onClose={onClose}>
      <div className="flex flex-col space-y-2">
        {ENTITY_CONFIGS.map((config) => (
          <Element
            key={config.key}
            leftSide={
              <span className="text-sm">
                {config.label}

                {config.description && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({config.description})
                  </span>
                )}
              </span>
            }
            noExternalPadding
            twoGridColumns
          >
            <Toggle
              checked={selectedEntities[config.key]}
              onChange={(value: boolean) =>
                handleToggleEntity(config.key, value)
              }
            />
          </Element>
        ))}

        <Button
          behavior="button"
          onClick={handleSubmit}
          disabled={
            isFormBusy || !Object.values(selectedEntities).some(Boolean)
          }
          disableWithoutIcon={!isFormBusy}
        >
          {t('sync')}
        </Button>
      </div>
    </Modal>
  );
}
