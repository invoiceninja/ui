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
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Client } from '$app/common/interfaces/client';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client;
}

export function Standing(props: Props) {
  const { client } = props;

  const [t] = useTranslation();

  const colors = useColorScheme();

  const formatMoney = useFormatMoney();

  return (
    <>
      {client && (
        <Card
          title={t('standing')}
          className="col-span-12 lg:col-span-6 xl:col-span-4 shadow-sm h-full xl:h-max"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
          withoutBodyPadding
        >
          <div className="flex flex-col px-6 pb-6">
            <div
              className="flex justify-between border-b border-dashed py-5"
              style={{ borderColor: colors.$24 }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: colors.$17 }}
              >
                {t('paid_to_date')}
              </span>

              <span className="text-sm font-mono">
                {formatMoney(
                  client.paid_to_date,
                  client.country_id,
                  client.settings.currency_id
                )}
              </span>
            </div>

            <div
              className="flex justify-between border-b border-dashed py-5"
              style={{ borderColor: colors.$24 }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: colors.$17 }}
              >
                {t('outstanding')}
              </span>

              <span className="text-sm font-mono">
                {formatMoney(
                  client.balance,
                  client.country_id,
                  client.settings.currency_id
                )}
              </span>
            </div>

            <div
              className="flex justify-between border-b border-dashed py-5"
              style={{ borderColor: colors.$24 }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: colors.$17 }}
              >
                {t('credit_balance')}
              </span>

              <span className="text-sm font-mono">
                {formatMoney(
                  client.credit_balance,
                  client.country_id,
                  client.settings.currency_id
                )}
              </span>
            </div>

            {client.payment_balance > 0 && (
              <div
                className="flex justify-between border-b border-dashed py-5"
                style={{ borderColor: colors.$24 }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$17 }}
                >
                  {t('payment_balance')}
                </span>

                <span className="text-sm font-mono">
                  {formatMoney(
                    client.payment_balance,
                    client.country_id,
                    client.settings.currency_id
                  )}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
