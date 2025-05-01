/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Client } from '$app/common/interfaces/client';
import { EntityStatus } from '$app/components/EntityStatus';
import { useTranslation } from 'react-i18next';
import { useGetSetting } from '$app/common/hooks/useGetSetting';
import { route } from '$app/common/helpers/route';
import { CustomFields, useCustomField } from '$app/components/CustomField';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';
import { useColorScheme } from '$app/common/colors';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { InfoCard } from '$app/components/InfoCard';

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
  const resolveCountry = useResolveCountry();
  const formatCustomFieldValue = useFormatCustomFieldValue();

  const isAnyCustomFieldPopulated = () => {
    const fields = ['client1', 'client2', 'client3', 'client4'];

    return fields.some((field) => {
      const label = customField(field as CustomFields).label();
      const value = client[`custom_value${field.slice(-1)}` as keyof Client];

      return Boolean(label && value);
    });
  };

  return (
    <>
      {client && (
        <InfoCard
          title={t('details')}
          className="h-full 2xl:h-max col-span-12 lg:col-span-6 xl:col-span-4 2xl:col-span-3 shadow-sm"
          style={{ borderColor: colors.$24 }}
        >
          <div className="flex flex-col pt-2 space-y-3 h-44 overflow-y-auto">
            <div className="flex flex-col space-y-1">
              <span
                className="text-sm font-medium"
                style={{ color: colors.$22 }}
              >
                {t('status')}
              </span>

              <div>
                <EntityStatus entity={client} />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <span
                className="text-sm font-medium"
                style={{ color: colors.$22 }}
              >
                {t('number')}
              </span>

              <span
                className="text-sm font-medium"
                style={{ color: colors.$3 }}
              >
                {client.number}
              </span>
            </div>

            {client.group_settings_id && (
              <div className="flex flex-col space-y-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('group')}
                </span>

                <Link
                  className="font-medium"
                  to={route('/settings/group_settings/:id/edit', {
                    id: client.group_settings_id,
                  })}
                >
                  {client.group_settings?.name}
                </Link>
              </div>
            )}

            {client.website && (
              <div className="flex flex-col space-y-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('website')}
                </span>

                <Link
                  className="font-medium"
                  to={client.website}
                  external
                  style={{ textAlign: 'left' }}
                >
                  {client.website}
                </Link>
              </div>
            )}

            {client.vat_number.length > 1 && (
              <div className="flex flex-col space-y-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('vat_number')}
                </span>

                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$3 }}
                >
                  {client.vat_number}
                </span>
              </div>
            )}

            {client.phone.length > 1 && (
              <div className="flex flex-col space-y-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('phone')}
                </span>

                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$3 }}
                >
                  {client.phone}
                </span>
              </div>
            )}

            {parseFloat(client.settings.default_task_rate) > 0 && (
              <div className="flex flex-col space-y-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('task_rate')}
                </span>

                <span
                  className="text-sm font-medium font-mono"
                  style={{ color: colors.$3 }}
                >
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
              </div>
            )}

            {import.meta.env.VITE_IS_TEST === 'true' && (
              <span data-cy="settingsTestingSpan">
                {getSetting(props.client, 'military_time')}
              </span>
            )}

            {isAnyCustomFieldPopulated() && (
              <div className="flex flex-col space-y-1">
                {['client1', 'client2', 'client3', 'client4'].map((field) => {
                  const label = customField(field as CustomFields).label();
                  const value =
                    client[`custom_value${field.slice(-1)}` as keyof Client];

                  return (
                    Boolean(label && value) && (
                      <div key={field} className="flex flex-col space-y-1">
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors.$22 }}
                        >
                          {label}
                        </span>

                        <span
                          className="text-sm font-medium"
                          style={{ color: colors.$3 }}
                        >
                          {formatCustomFieldValue(field, value as string)}
                        </span>
                      </div>
                    )
                  );
                })}
              </div>
            )}
          </div>
        </InfoCard>
      )}
    </>
  );
}
