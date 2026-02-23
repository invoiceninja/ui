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
import { Modal } from '$app/components/Modal';
import { Button, SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Element } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { AxiosError } from 'axios';
import classNames from 'classnames';

interface EntityConfig {
  key: string;
  label: string;
  skipOptions: { value: string; label: string }[];
  dependsOn?: string[];
}

const ENTITY_CONFIGS: EntityConfig[] = [
  {
    key: 'products',
    label: 'products',
    skipOptions: [{ value: 'product_key', label: 'product_key' }],
  },
  {
    key: 'clients',
    label: 'clients',
    skipOptions: [
      { value: 'email', label: 'email' },
      { value: 'name', label: 'name' },
    ],
  },
  {
    key: 'vendors',
    label: 'vendors',
    skipOptions: [
      { value: 'email', label: 'email' },
      { value: 'name', label: 'name' },
    ],
  },
  {
    key: 'invoices',
    label: 'invoices',
    skipOptions: [{ value: 'number', label: 'invoice_number' }],
    dependsOn: ['clients'],
  },
  {
    key: 'quotes',
    label: 'quotes',
    skipOptions: [{ value: 'number', label: 'invoice_number' }],
    dependsOn: ['clients'],
  },
  {
    key: 'payments',
    label: 'payments',
    skipOptions: [{ value: 'number', label: 'number' }],
    dependsOn: ['clients', 'invoices'],
  },
];

interface InitialSyncModalProps {
  visible: boolean;
  onClose: () => void;
}

export function InitialSyncModal({ visible, onClose }: InitialSyncModalProps) {
  const [t] = useTranslation();
  const [isFormBusy, setIsFormBusy] = useState(false);

  const [selectedEntities, setSelectedEntities] = useState<
    Record<string, boolean>
  >({
    products: false,
    clients: false,
    vendors: false,
    invoices: false,
    quotes: false,
    payments: false,
  });

  const [skipColumns, setSkipColumns] = useState<Record<string, string>>({
    products: 'always_create',
    clients: 'always_create',
    vendors: 'always_create',
    invoices: 'always_create',
    quotes: 'always_create',
    payments: 'always_create',
  });

  const isEntityAvailable = (config: EntityConfig): boolean => {
    if (!config.dependsOn) return true;

    return config.dependsOn.every((dep) => selectedEntities[dep]);
  };

  const handleToggleEntity = (key: string, value: boolean) => {
    const newSelected = { ...selectedEntities, [key]: value };

    if (!value) {
      ENTITY_CONFIGS.forEach((config) => {
        if (config.dependsOn?.includes(key)) {
          newSelected[config.key] = false;
        }
      });

      ENTITY_CONFIGS.forEach((config) => {
        if (
          config.dependsOn &&
          !config.dependsOn.every((dep) => newSelected[dep])
        ) {
          newSelected[config.key] = false;
        }
      });
    }

    setSelectedEntities(newSelected);
  };

  const handleSync = () => {
    const payload: Record<string, string> = {};

    Object.entries(selectedEntities).forEach(([key, isSelected]) => {
      if (isSelected) {
        payload[key] = skipColumns[key];
      }
    });

    if (Object.keys(payload).length === 0) {
      return;
    }

    setIsFormBusy(true);

    request('POST', endpoint('/api/v1/quickbooks/initial_sync'), payload)
      .then(() => {
        toast.success('initial_sync_started');
        onClose();
      })
      .catch((error: AxiosError) => {
        console.error(error);
        toast.error();
      })
      .finally(() => setIsFormBusy(false));
  };

  return (
    <Modal
      title={t('initial_sync')}
      visible={visible}
      onClose={onClose}
      size="regular"
    >
      <div className="flex flex-col space-y-2">
        {ENTITY_CONFIGS.map((config, index) => {
          const available = isEntityAvailable(config);
          const checked = selectedEntities[config.key];

          return (
            <div key={index} className="flex w-full h-12 items-center">
              <Element
                leftSide={t(config.label)}
                noExternalPadding
                className={classNames('w-full', {
                  'opacity-75': !available,
                })}
                noVerticalPadding
              >
                <div className="flex items-center space-x-4">
                  <Toggle
                    checked={checked}
                    disabled={!available}
                    onChange={(value: boolean) =>
                      handleToggleEntity(config.key, value)
                    }
                  />

                  {checked && (
                    <div className="flex-1">
                      <SelectField
                        value={skipColumns[config.key]}
                        onValueChange={(value) =>
                          setSkipColumns((prev) => ({
                            ...prev,
                            [config.key]: value,
                          }))
                        }
                        customSelector
                        dismissable={false}
                      >
                        <option value="always_create">
                          {t('always_create')}
                        </option>
                        {config.skipOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {t('skip_if_match_on')} ({t(opt.label)})
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  )}
                </div>
              </Element>
            </div>
          );
        })}

        <div className="flex justify-end pt-4">
          <Button
            behavior="button"
            onClick={handleSync}
            disabled={
              isFormBusy || !Object.values(selectedEntities).some(Boolean)
            }
            disableWithoutIcon={!isFormBusy}
          >
            {t('sync')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
