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

interface QuickBooksImportTabProps {
  syncSelections: SyncSelections;
  onSyncSelectionChange: (key: keyof SyncSelections, value: boolean) => void;
  onSync: () => void;
  isSyncBusy: boolean;
  hasSyncSelection: boolean;
}

export function QuickBooksImportTab({
  syncSelections,
  onSyncSelectionChange,
  onSync,
  isSyncBusy,
  hasSyncSelection,
}: QuickBooksImportTabProps) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  return (
    <>
      <h3 className="leading-6 font-medium mb-4">{t('sync_data')}</h3>

      <Element leftSide={t('products')} noExternalPadding>
        <Toggle
          checked={syncSelections.product}
          onChange={(value: boolean) => onSyncSelectionChange('product', value)}
        />
      </Element>

      <Element leftSide={t('clients')} noExternalPadding>
        <Toggle
          checked={syncSelections.client}
          onChange={(value: boolean) => onSyncSelectionChange('client', value)}
        />
      </Element>

      <Element leftSide={t('invoices')} noExternalPadding>
        <Toggle
          checked={syncSelections.invoice}
          onChange={(value: boolean) => onSyncSelectionChange('invoice', value)}
        />
      </Element>

      <Element leftSide="" noExternalPadding>
        <Button
          type="primary"
          behavior="button"
          onClick={onSync}
          disabled={isSyncBusy || !hasSyncSelection}
          disableWithoutIcon
        >
          {t('sync')}
        </Button>
      </Element>
    </>
  );
}
