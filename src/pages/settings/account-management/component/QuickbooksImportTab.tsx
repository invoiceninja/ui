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
import { Button } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';

interface SyncSelections {
  product: boolean;
  client: boolean;
  invoice: boolean;
}

interface QuickbooksImportTabProps {
  syncSelections: SyncSelections;
  onSyncSelectionChange: (key: keyof SyncSelections, value: boolean) => void;
  onSync: () => void;
  isSyncBusy: boolean;
  hasSyncSelection: boolean;
}

export function QuickbooksImportTab(props: QuickbooksImportTabProps) {
  const {
    syncSelections,
    onSyncSelectionChange,
    onSync,
    isSyncBusy,
    hasSyncSelection,
  } = props;

  const [t] = useTranslation();
  const colors = useColorScheme();

  return (
    <div className="space-y-4 px-4 sm:px-6 py-4">
      <p className="text-sm mb-4" style={{ color: colors.$3 }}>
        {t('sync_data_from_quickbooks_to_invoice_ninja')}
      </p>

      <Element leftSide={t('products')}>
        <Toggle
          checked={syncSelections.product}
          onChange={(value: boolean) => onSyncSelectionChange('product', value)}
        />
      </Element>

      <Element leftSide={t('clients')}>
        <Toggle
          checked={syncSelections.client}
          onChange={(value: boolean) => onSyncSelectionChange('client', value)}
        />
      </Element>

      <Element leftSide={t('invoices')}>
        <Toggle
          checked={syncSelections.invoice}
          onChange={(value: boolean) => onSyncSelectionChange('invoice', value)}
        />
      </Element>

      <Element leftSide="">
        <Button
          type="primary"
          behavior="button"
          onClick={onSync}
          disabled={isSyncBusy || !hasSyncSelection}
        >
          {t('sync')}
        </Button>
      </Element>
    </div>
  );
}
