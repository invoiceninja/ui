/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Paymentable } from '$app/common/interfaces/payment';

import { useOutletContext } from 'react-router-dom';
import { Context } from '../Edit';
import { ClickableElement } from '$app/components/cards/ClickableElement';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { Payment } from '$app/common/interfaces/payment';
import { useTranslation } from 'react-i18next';
import { date } from '$app/common/helpers';
import { PaymentStatus } from '$app/pages/payments/common/components/PaymentStatus';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Card } from '$app/components/cards';

function Payments() {
  const [t] = useTranslation();

  const context: Context = useOutletContext();
  const { invoice } = context;

  const formatMoney = useFormatMoney();
  const disableNavigation = useDisableNavigation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  return (
    <Card
      title={t('payments')}
      withScrollableBody
      style={{ maxHeight: '42.5rem' }}
    >
      <div className="divide-y">
        {invoice?.payments &&
          invoice.payments.map((payment: Payment) =>
            payment.paymentables
              .filter(
                (item) =>
                  item.invoice_id == invoice?.id && item.archived_at == 0
              )
              .map((paymentable: Paymentable) => (
                <ClickableElement
                  key={payment.id}
                  to={`/payments/${payment.id}/edit`}
                  disableNavigation={disableNavigation('payment', payment)}
                >
                  <div className="flex flex-col space-y-2">
                    <p className="font-semibold">
                      {t('payment')} {payment.number}
                    </p>

                    <p className="inline-flex items-center space-x-1">
                      <p>
                        {formatMoney(
                          paymentable.amount,
                          payment.client?.country_id,
                          payment.client?.settings.currency_id
                        )}
                      </p>
                      <p>&middot;</p>
                      <p>{date(paymentable.created_at, dateFormat)}</p>
                    </p>

                    <div>
                      <PaymentStatus entity={payment} />
                    </div>
                  </div>
                </ClickableElement>
              ))
          )}
      </div>
    </Card>
  );
}

export default Payments;
