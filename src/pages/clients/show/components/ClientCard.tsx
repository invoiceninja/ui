/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '$app/common/interfaces/client';
import { InfoCard } from '$app/components/InfoCard';
import { ClientActionButtons } from '$app/pages/invoices/common/components/ClientActionButtons';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client;
}

export function ClientCard(props: Props) {
  const [t] = useTranslation();

  const { client } = props;

  return (
    <>
      {client && (
        <div className="col-span-12 lg:col-span-3">
          <InfoCard
            title={t('client')}
            value={<ClientActionButtons displayClientName client={client} />}
            className="h-full"
          />
        </div>
      )}
    </>
  );
}
