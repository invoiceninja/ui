/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms/SelectField';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  QuickbooksSettings,
  QuickbooksSyncDirection,
} from '$app/common/interfaces/quickbooks';

interface SyncDirectionOption {
  value: QuickbooksSyncDirection;
  label: string;
}

interface SyncEntityConfig {
  key: string;
  translationKey: string;
}

const SYNC_ENTITIES: SyncEntityConfig[] = [
  { key: 'client', translationKey: 'client' },
  { key: 'invoice', translationKey: 'invoice' },
  { key: 'product', translationKey: 'products' },
];

interface QuickbooksSyncTabProps {
  quickbooksSettings: QuickbooksSettings;
  onSyncDirectionChange: (
    entity: string,
    direction: QuickbooksSyncDirection
  ) => void;
}

export function QuickbooksSyncTab({
  quickbooksSettings,
  onSyncDirectionChange,
}: QuickbooksSyncTabProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const syncDirectionOptions: SyncDirectionOption[] = [
    { value: QuickbooksSyncDirection.None, label: t('none') },
    { value: QuickbooksSyncDirection.Push, label: t('push') },
    { value: QuickbooksSyncDirection.Pull, label: t('pull') },
    {
      value: QuickbooksSyncDirection.Bidirectional,
      label: t('bidirectional'),
    },
  ];

  return (
    <div className="space-y-4 px-4 sm:px-6 py-4">
      <div className="space-y-3">
        <p className="text-sm" style={{ color: colors.$3 }}>
          These settings control the direction of data sync between QuickBooks
          and Invoice Ninja.
        </p>

        <ul
          className="list-disc list-inside space-y-2 text-sm"
          style={{ color: colors.$3 }}
        >
          <li>
            <strong>{t('none')}:</strong> 'No data will be synced.'
          </li>
          <li>
            <strong>{t('push')}:</strong> 'Only data from Invoice Ninja will be
            synced to QuickBooks.'
          </li>
          <li>
            <strong>{t('pull')}:</strong> 'Only data from QuickBooks will be
            synced to Invoice Ninja.'
          </li>
          <li>
            <strong>{t('bidirectional')}:</strong> 'Data will be synced in both
            directions.' <strong>{t('caution') || 'Caution'}:</strong> 'This may
            have unintended consequences!'
          </li>
        </ul>
      </div>

      {SYNC_ENTITIES.map(({ key, translationKey }) => {
        const setting = quickbooksSettings[key as keyof QuickbooksSettings];

        const direction =
          setting && typeof setting === 'object' && 'direction' in setting
            ? setting.direction
            : QuickbooksSyncDirection.None;

        return (
          <Element key={key} leftSide={t(translationKey)}>
            <SelectField
              value={direction}
              onValueChange={(value) =>
                onSyncDirectionChange(key, value as QuickbooksSyncDirection)
              }
              customSelector
              dismissable={false}
            >
              {syncDirectionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </Element>
        );
      })}
    </div>
  );
}
