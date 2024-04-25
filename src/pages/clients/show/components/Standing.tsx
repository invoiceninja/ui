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
import { NotesIframe } from '$app/components/NotesIframe';
import { Element } from '$app/components/cards';
import { Icon } from '$app/components/icons/Icon';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdLockOutline } from 'react-icons/md';

interface Props {
  client: Client;
}

export function Standing(props: Props) {
  const [t] = useTranslation();

  const formatMoney = useFormatMoney();

  const { client } = props;

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef?.current) {
      const iframeDocument =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow?.document;

      if (iframeDocument) {
        const scrollHeight = iframeDocument.body.scrollHeight + 'px';

        iframeDocument.body.style.margin = '0';
        iframeDocument.body.style.display = 'flex';
        iframeDocument.body.style.alignItems = 'center';

        iframeRef.current.height = scrollHeight;
        iframeDocument.documentElement.style.height = scrollHeight;
        console.log(iframeDocument.documentElement.offsetHeight);
      }
    }
  }, [iframeRef]);

  return (
    <>
      {client && (
        <div className="col-span-12 lg:col-span-3">
          <InfoCard
            title={t('standing')}
            value={
              <div className="flex flex-col space-y-2">
                <Element
                  leftSide={
                    <span className="font-bold">{t('paid_to_date')}</span>
                  }
                  pushContentToRight
                  noExternalPadding
                  noVerticalPadding
                >
                  {formatMoney(
                    client.paid_to_date,
                    client.country_id,
                    client.settings.currency_id
                  )}
                </Element>

                <Element
                  leftSide={
                    <span className="font-bold">{t('outstanding')}</span>
                  }
                  pushContentToRight
                  noExternalPadding
                  noVerticalPadding
                >
                  {formatMoney(
                    client.balance,
                    client.country_id,
                    client.settings.currency_id
                  )}
                </Element>

                <Element
                  leftSide={
                    <span className="font-bold">{t('credit_balance')}</span>
                  }
                  pushContentToRight
                  noExternalPadding
                  noVerticalPadding
                >
                  {formatMoney(
                    client.credit_balance,
                    client.country_id,
                    client.settings.currency_id
                  )}
                </Element>

                {client.payment_balance > 0 && (
                  <Element
                    leftSide={
                      <span className="font-bold">{t('payment_balance')}</span>
                    }
                    pushContentToRight
                    noExternalPadding
                    noVerticalPadding
                  >
                    {formatMoney(
                      client.payment_balance,
                      client.country_id,
                      client.settings.currency_id
                    )}
                  </Element>
                )}

                {client.private_notes && (
                  <div className="flex items-center space-x-1">
                    <div>
                      <Icon element={MdLockOutline} size={24} />
                    </div>

                    <div className="whitespace-normal">
                      <NotesIframe srcDoc={client.private_notes} />
                    </div>
                  </div>
                )}
              </div>
            }
            className="h-full"
          />
        </div>
      )}
    </>
  );
}
