/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { Client } from 'common/interfaces/client';
import { InfoCard } from 'components/InfoCard';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client;
}

export function Standing(props: Props) {
  const [t] = useTranslation();

  const formatMoney = useFormatMoney();

  const { client } = props;

  return (
    <>
      {client && (
        <div className="col-span-12 lg:col-span-3">
          <InfoCard
            title={t('standing')}
            value={
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{t('paid_to_date')}</p>
                  <span>
                    {formatMoney(
                      client.paid_to_date,
                      client.country_id,
                      client.settings.currency_id
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="font-semibold">{t('balance')}</p>
                  <span>
                    {formatMoney(
                      client.balance,
                      client.country_id,
                      client.settings.currency_id
                    )}
                  </span>
                </div>
              </div>
            }
            className="h-full"
          />
        </div>
      )}
    </>
  );
}
