/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useClientQuery } from 'common/queries/clients';
import { InfoCard } from 'components/InfoCard';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Standing() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data: client } = useClientQuery({ id });

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
                  <span>{client.data.data.paid_to_date}</span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="font-semibold">{t('balance')}</p>
                  <span>{client.data.data.balance}</span>
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
