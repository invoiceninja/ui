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
import { Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';

export function QuickBooksImportTab() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [isSyncBusy, setIsSyncBusy] = useState(false);

  const [syncSelections, setSyncSelections] = useState({
    product: false,
    client: false,
    invoice: false,
  });

  const hasSyncSelection = Object.values(syncSelections).some(Boolean);

  const handleSync = () => {
    if (isSyncBusy || !hasSyncSelection) return;

    setIsSyncBusy(true);
    toast.processing();

    request('POST', endpoint('/api/v1/quickbooks/sync'), {
      product: syncSelections.product,
      client: syncSelections.client,
      invoice: syncSelections.invoice,
    })
      .then(() => {
        toast.success('synced');
        setSyncSelections({ product: false, client: false, invoice: false });
      })
      .catch(() => {
        toast.error();
      })
      .finally(() => {
        setIsSyncBusy(false);
      });
  };

  return (
    <>
      <p className="text-sm mb-4" style={{ color: colors.$3 }}>
        {t('sync_data_from_quickbooks_to_invoice_ninja')}
      </p>

      <Element leftSide={t('products')} noExternalPadding>
        <Toggle
          checked={syncSelections.product}
          onChange={(value: boolean) =>
            setSyncSelections((prev) => ({ ...prev, product: value }))
          }
        />
      </Element>

      <Element leftSide={t('clients')} noExternalPadding>
        <Toggle
          checked={syncSelections.client}
          onChange={(value: boolean) =>
            setSyncSelections((prev) => ({ ...prev, client: value }))
          }
        />
      </Element>

      <Element leftSide={t('invoices')} noExternalPadding>
        <Toggle
          checked={syncSelections.invoice}
          onChange={(value: boolean) =>
            setSyncSelections((prev) => ({ ...prev, invoice: value }))
          }
        />
      </Element>

      <Element leftSide="" noExternalPadding>
        <Button
          type="primary"
          behavior="button"
          onClick={handleSync}
          disabled={isSyncBusy || !hasSyncSelection}
        >
          {t('sync')}
        </Button>
      </Element>
    </>
  );
}
