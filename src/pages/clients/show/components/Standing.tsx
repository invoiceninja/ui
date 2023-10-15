/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Client } from '$app/common/interfaces/client';
import { InfoCard } from '$app/components/InfoCard';
import { Element } from '$app/components/cards';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdLockOutline } from 'react-icons/md';

interface Props {
  client: Client;
}

export function Standing(props: Props) {
  const [t] = useTranslation();

  const formatMoney = useFormatMoney();

  const { client } = props;

  return (
    <>
      {client && (
        <div className="col-span-12 lg:col-span-3">
          <InfoCard
            title={t('standing')}
            value={
              <>
                <Element
                  leftSide={
                    <span className="font-bold">{t('paid_to_date')}</span>
                  }
                  pushContentToRight
                  noExternalPadding
                >
                  {formatMoney(
                    client.paid_to_date,
                    client.country_id,
                    client.settings.currency_id
                  )}
                </Element>

                <div className="flex items-center justify-between">
                  <p className="font-semibold">{t('outstanding')}</p>
                  <span>
                    {formatMoney(
                      client.balance,
                      client.country_id,
                      client.settings.currency_id
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="font-semibold">{t('credit_balance')}</p>
                  <span>
                    {formatMoney(
                      client.credit_balance,
                      client.country_id,
                      client.settings.currency_id
                    )}
                  </span>
                </div>

                {client.payment_balance > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{t('payment_balance')}</p>
                    <span>
                      {formatMoney(
                        client.payment_balance,
                        client.country_id,
                        client.settings.currency_id
                      )}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <div>
                    <Icon element={MdLockOutline} size={24} />
                  </div>

                  <span
                    dangerouslySetInnerHTML={{
                      __html: `${client.private_notes}`,
                    }}
                  />
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
