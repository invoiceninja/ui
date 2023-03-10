/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { Client } from '$app/common/interfaces/client';
import { InfoCard } from '$app/components/InfoCard';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface Props {
  client: Client;
}

export function ClientCard(props: Props) {
  const [t] = useTranslation();

  return (
    <>
      {props.client && (
        <div className="col-span-12 lg:col-span-3">
          <InfoCard
            title={t('client')}
            value={
              <Link to={route('/clients/:id', { id: props.client.id })}>
                {props.client.display_name}
              </Link>
            }
            className="h-full"
          />
        </div>
      )}
    </>
  );
}
