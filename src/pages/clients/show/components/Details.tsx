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
import { CustomFields, useCustomField } from '$app/components/CustomField';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';
import { useColorScheme } from '$app/common/colors';

interface Props {
  client: Client;
}

export function Details(props: Props) {
  const [t] = useTranslation();

  const { client } = props;

  const colors = useColorScheme();
  const company = useCurrentCompany();

  const getSetting = useGetSetting();
  const formatMoney = useFormatMoney();
  const customField = useCustomField();
  const formatCustomFieldValue = useFormatCustomFieldValue();

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

                <div className="flex flex-col space-y-1 mt-2">
                  {['client1', 'client2', 'client3', 'client4'].map((field) => {
                    const label = customField(field as CustomFields).label();
                    const value =
                      client[`custom_value${field.slice(-1)}` as keyof Client];

                    return (
                      Boolean(label && value) && (
                        <div key={field} className="flex space-x-2">
                          <span
                            className="font-medium"
                            style={{ color: colors.$3, colorScheme: colors.$0 }}
                          >
                            {label}
                          </span>
                          <span>
                            {formatCustomFieldValue(field, value as string)}
                          </span>
                        </div>
                      )
                    );
                  })}
                </div>
              </>
            }
            className="h-full"
          />
        </div>
      )}
    </>
  );
}
