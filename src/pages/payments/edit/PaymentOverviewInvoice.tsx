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
import { Link, generatePath } from 'react-router-dom';

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
          {`${t('invoice')} `}
          <Link
            to={generatePath('/invoices/:id/edit', {
              id: props.paymentable.invoice_id,
            })}
          >
            {setLabel(props.payment, props.paymentable)}
          </Link>
        </span>
      </div>
      <div className="flex items-center justify-center">
        <span className="text-gray-400">
          {formatMoney(
            props?.paymentable?.amount || 0,
            company.settings.country_id,
            props.payment?.currency_id
          )}
        </span>
        <span className="text-gray-400 mx-5">
          {formatDate(
            new Date(props.paymentable.created_at * 1000).toString(),
            dateFormat
          )}
        </span>
      </div>
    </div>
  );
}
