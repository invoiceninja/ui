/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useResolveCountry } from 'common/hooks/useResolveCountry';
import { useClientQuery } from 'common/queries/clients';
import { InfoCard } from 'components/InfoCard';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Address() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: client } = useClientQuery({ id });
  const resolveCountry = useResolveCountry();

  return (
    <>
      {client && (
        <div className="col-span-12 lg:col-span-3">
          <InfoCard
            title={t('address')}
            value={
              <>
                <p>
                  {client.data.data.address1.length > 0 &&
                    `${client.data.data.address1}, `}
                  {client.data.data.address2}
                </p>

                <p>
                  {client.data.data.city.length > 0 &&
                    `${client.data.data.city}, `}
                  {client.data.data.state}
                </p>

                <p>{resolveCountry(client.data.data.country_id)?.full_name}</p>
              </>
            }
            className="h-full"
          />
        </div>
      )}
    </>
  );
}
