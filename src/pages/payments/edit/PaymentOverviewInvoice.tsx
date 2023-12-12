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
import { useTranslation } from 'react-i18next';
import { Payment, Paymentable } from '$app/common/interfaces/payment';
import { Invoice } from '$app/common/interfaces/invoice';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date as formatDate } from '$app/common/helpers';
import { Link } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { MdOutlineFileOpen } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';

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
  const { dateFormat } = useCurrentCompanyDateFormats();
  const colors = useColorScheme();

  return (
    <>
      {props.paymentable.invoice_id && (
        <div className="grid grid-cols-1 gap-2 my-2 border border-x-5 py-4">
          <div className="flex items-center justify-center">
            <span className="flex item-center gap-2" style={{ color: colors.$3, colorScheme: colors.$0 }}>
              {`${t('invoice')} `}
              <Link
                to={route('/invoices/:id/edit', {
                  id: props.paymentable.invoice_id,
                })}
              >
                <span className="flex items-center gap-2" style={{ color: colors.$3, colorScheme: colors.$0 }}>
                  {setLabel(props.payment, props.paymentable)}{' '}
                  <MdOutlineFileOpen />
                </span>
              </Link>
            </span>
          </div>
          <div className="flex items-center justify-center">
            <span style={{ color: colors.$3, colorScheme: colors.$0 }}>
              {formatMoney(
                props?.paymentable?.amount || 0,
                props.payment.client?.country_id,
                props.payment?.currency_id
              )}
            </span>
            <span className="mx-5" style={{ color: colors.$3, colorScheme: colors.$0 }}>
              {formatDate(
                new Date(props.paymentable.created_at * 1000).toString(),
                dateFormat
              )}
            </span>
          </div>
        </div>
      )}

      {props.paymentable.credit_id && (
        <div className="grid grid-cols-1 gap-2 my-2 border border-x-5 py-4">
          <div className="flex items-center justify-center">
            <span style={{ color: colors.$3, colorScheme: colors.$0 }}>
              <Link
                to={route('/credits/:id/edit', {
                  id: props.paymentable.credit_id,
                })}
              >
                {`${t('credit')} `}
              </Link>
            </span>
          </div>
          <div className="flex items-center justify-center">
            <span style={{ color: colors.$3, colorScheme: colors.$0 }}>
              {formatMoney(
                props?.paymentable?.amount || 0,
                props.payment.client?.country_id,
                props.payment?.currency_id
              )}
            </span>
            <span className="mx-5" style={{ color: colors.$3, colorScheme: colors.$0 }}>
              {formatDate(
                new Date(props.paymentable.created_at * 1000).toString(),
                dateFormat
              )}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
