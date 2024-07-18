/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { Link } from '$app/components/forms';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Client } from '$app/common/interfaces/client';
import { InfoCard } from '$app/components/InfoCard';
import { EntityStatus } from '$app/components/EntityStatus';
import { useTranslation } from 'react-i18next';
import { useGetSetting } from '$app/common/hooks/useGetSetting';
import { route } from '$app/common/helpers/route';

interface Props {
  client: Client;
}

export function Details(props: Props) {
  const [t] = useTranslation();

  const { client } = props;

  const company = useCurrentCompany();

  const getSetting = useGetSetting();
  const formatMoney = useFormatMoney();

  return (
    <>
      {client && (
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <InfoCard
            title={t('details')}
            value={
              <>
                <div className="space-y-2 mb-4">
                  <Element
                    leftSide={t('status')}
                    noExternalPadding
                    noVerticalPadding
                  >
                    <EntityStatus entity={client} />
                  </Element>

                  <Element
                    leftSide={t('number')}
                    noExternalPadding
                    noVerticalPadding
                  >
                    {client.number}
                  </Element>
                </div>

                {client.group_settings_id && (
                  <Element leftSide={t('group')} noExternalPadding>
                    <Link
                      to={route('/settings/group_settings/:id/edit', {
                        id: client.group_settings_id,
                      })}
                    >
                      {client.group_settings?.name}
                    </Link>
                  </Element>
                )}

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

                {import.meta.env.VITE_IS_TEST === 'true' && (
                  <span data-cy="settingsTestingSpan">
                    {getSetting(props.client, 'military_time')}
                  </span>
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
