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
import { useClientQuery } from 'common/queries/clients';
import { InfoCard } from 'components/InfoCard';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Details() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data: client } = useClientQuery({ id });

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
              </>
            }
            className="h-full"
          />
        </div>
      )}
    </>
  );
}
