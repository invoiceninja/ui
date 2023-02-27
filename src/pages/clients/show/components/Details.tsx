/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '@invoiceninja/cards';
import { Link } from '@invoiceninja/forms';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Client } from 'common/interfaces/client';
import { InfoCard } from 'components/InfoCard';
import { EntityStatus } from 'components/EntityStatus';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client;
}

export function Details(props: Props) {
  const [t] = useTranslation();

  const formatMoney = useFormatMoney();

  const company = useCurrentCompany();

  const { client } = props;

  return (
    <>
      {client && (
        <div className="col-span-12 lg:col-span-3">
          <InfoCard
            title={t('details')}
            value={
              <>
                <Element leftSide={t('status')} noExternalPadding>
                  <EntityStatus entity={client} />
                </Element>

                <Link to={client.website} external>
                  {client.website}
                </Link>

                {client.vat_number.length > 1 && (
                  <p>
                    {t('vat_number')}: {client.vat_number}
                  </p>
                )}

                {client.phone.length > 1 && (
                  <p>
                    {t('phone')}: {client.phone}
                  </p>
                )}

                {parseFloat(client.settings.default_task_rate) > 0 && (
                  <p className="space-x-1">
                    <span>{t('task_rate')}:</span>
                    <span>
                      {client.settings.default_task_rate
                        ? formatMoney(
                            client.settings.default_task_rate,
                            client.country_id,
                            client.settings.currency_id
                          )
                        : formatMoney(
                            company.settings.default_task_rate,
                            client.country_id,
                            company.settings.currency_id
                          )}
                    </span>
                  </p>
                )}
              </>
            }
            className="h-full"
          />
        </div>
      )}
    </>
  );
}
