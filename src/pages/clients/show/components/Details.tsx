/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useClientQuery } from 'common/queries/clients';
import { InfoCard } from 'components/InfoCard';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Details() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data: client } = useClientQuery({ id });
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  return (
    <>
      {client && (
        <div className="col-span-12 lg:col-span-3">
          <InfoCard
            title={t('details')}
            value={
              <>
                <Link to={client.data.data.website} external>
                  {client.data.data.website}
                </Link>

                <p>{t('vat_number')}: {client.data.data.vat_number}</p>
                <p>{t('phone')}: {client.data.data.phone}</p>
                <p>{t('task_rate')}: {client.data.data.settings.default_task_rate ? formatMoney(client.data.data.settings.default_task_rate, client.data.data.country_id, client.data.data.settings.currency_id) : formatMoney(company.settings.default_task_rate, client.data.data.country_id, company.settings.currency_id)}</p>
              </>
            }
            className="h-full"
          />
        </div>
      )}
    </>
  );
}
