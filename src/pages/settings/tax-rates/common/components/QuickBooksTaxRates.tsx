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
import { Card, Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';

export function QuickBooksTaxRates() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const company = useCurrentCompany();

  const [isSyncBusy, setIsSyncBusy] = useState<boolean>(false);

  const taxRateMap = useMemo(
    () => company?.quickbooks?.settings?.tax_rate_map,
    [company?.quickbooks?.settings?.tax_rate_map]
  );

  const handleSyncTaxRates = () => {
    if (isSyncBusy) return;

    toast.processing();
    setIsSyncBusy(true);

    request('POST', endpoint('/api/v1/quickbooks/sync_tax_rates'))
      .then(() => {
        toast.success('synced');
      })
      .finally(() => setIsSyncBusy(false));
  };

  return (
    <Card
      title={t('tax_rates')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <div
        className="text-sm p-4 rounded-md mx-4 mb-4"
        style={{ backgroundColor: colors.$4, color: colors.$3 }}
      >
        {t('manage_taxes_in_quickbooks')}
      </div>

      {taxRateMap && taxRateMap.length > 0 ? (
        <>
          {taxRateMap.map((entry) => (
            <Element key={entry.id} leftSide={entry.name}>
              <span className="text-sm" style={{ color: colors.$3 }}>
                {entry.rate}%
              </span>
            </Element>
          ))}
        </>
      ) : (
        <div className="text-sm px-4 pb-4" style={{ color: colors.$3 }}>
          {t('no_tax_rates_found')}
        </div>
      )}

      <div className="flex justify-end px-4 pb-4">
        <Button
          type="primary"
          behavior="button"
          onClick={handleSyncTaxRates}
          disabled={isSyncBusy}
          disableWithoutIcon={isSyncBusy}
        >
          {t('sync_tax_rates')}
        </Button>
      </div>
    </Card>
  );
}
