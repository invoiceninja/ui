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
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';

export function QuickBooksImportTab() {
  const [t] = useTranslation();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [syncSelections, setSyncSelections] = useState({
    invoice: false,
    client: false,
    product: false,
  });

  const handleSubmit = () => {
    if (isFormBusy || !Object.values(syncSelections).some(Boolean)) return;

    setIsFormBusy(true);
    toast.processing();

    request('POST', endpoint('/api/v1/quickbooks/sync'), {
      invoice: syncSelections.invoice,
      client: syncSelections.client,
      product: syncSelections.product,
    })
      .then(() => {
        toast.success('sync_started');

        setSyncSelections({
          invoice: false,
          client: false,
          product: false,
        });
      })
      .catch(() => {
        toast.error();
      })
      .finally(() => {
        setIsFormBusy(false);
      });
  };

  return (
    <>
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
          onClick={handleSubmit}
          disabled={isFormBusy || !Object.values(syncSelections).some(Boolean)}
          disableWithoutIcon={!isFormBusy}
        >
          {t('sync')}
        </Button>
      </Element>
    </>
  );
}
