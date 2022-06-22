/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTranslation } from 'react-i18next';
import { Payment, Paymentable } from 'common/interfaces/payment';
import { Invoice } from 'common/interfaces/invoice';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { date as formatDate } from 'common/helpers';

interface Props {
  payment: Payment;
  paymentable: Paymentable;
}

export function setLabel(payment: Payment, paymentable: Paymentable): string {
  const invoice = payment?.invoices?.find(
    (invoice: Invoice) => invoice.id == paymentable.invoice_id
  );

  return invoice?.number || '';
}

export function PaymentOverviewInvoice(props: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const { dateFormat } = useCurrentCompanyDateFormats();

  return (
    <div className="grid grid-cols-1 gap-2 my-2 border border-x-5 py-4">
      <div className="flex items-center justify-center">
        <span className="text-gray-800">
          {`${t('invoice')} ${setLabel(props.payment, props.paymentable)}`}
        </span>
      </div>
      <div className="flex items-center justify-center">
        <span className="text-gray-400">
          {formatMoney(
            props?.payment?.amount || 0,
            company.settings.country_id,
            props.payment?.currency_id
          )}

          {formatDate(
            new Date(props.paymentable.created_at * 1000).toString(),
            dateFormat
          )}
        </span>
      </div>
    </div>
  );
}
