/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { Client } from '$app/common/interfaces/client';
import { InfoCard } from '$app/components/InfoCard';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client;
}

export function Address(props: Props) {
  const { t } = useTranslation();

  const { client } = props;

  const colors = useColorScheme();

  const resolveCountry = useResolveCountry();

  return (
    <>
      {client && (
        <InfoCard
          title={t('address')}
          withoutTruncate
          className="shadow-sm h-full 2xl:h-max col-span-12 lg:col-span-6 xl:col-span-4 2xl:col-span-3"
          style={{ borderColor: colors.$24 }}
        >
          <div className="flex flex-col pt-2 h-44 overflow-y-auto">
            {(client.address1 || client.address2) && (
              <span
                className="break-all text-sm font-medium"
                style={{ color: colors.$3 }}
              >
                {client.address1.length > 0 && client.address1}
                {client.address1.length > 0 && <br />}
                {client.address2}
              </span>
            )}

            {(client.city || client.state || client.postal_code) && (
              <span
                className="break-all text-sm font-medium"
                style={{ color: colors.$3 }}
              >
                {client.city.length > 0 && client.city} &nbsp;
                {client.state} &nbsp;
                {client.postal_code.length > 0 && client.postal_code}
              </span>
            )}

            {resolveCountry(client.country_id)?.name && (
              <span
                className="break-all text-sm font-medium"
                style={{ color: colors.$3 }}
              >
                {resolveCountry(client.country_id)?.name}
              </span>
            )}
          </div>
        </InfoCard>
      )}
    </>
  );
}
