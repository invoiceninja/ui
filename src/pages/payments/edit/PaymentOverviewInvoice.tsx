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
import { useColorScheme } from '$app/common/colors';
import { Credit } from '$app/common/interfaces/credit';
import { ExternalLink } from '$app/components/icons/ExternalLink';

interface Props {
  payment: Payment;
  paymentable: Paymentable;
}

export function setLabel(
  payment: Payment,
  paymentable: Paymentable,
  isCredit?: boolean
): string {
  if (isCredit) {
    const credit = payment?.credits?.find(
      (credit: Credit) => credit.id == paymentable.credit_id
    );

    return credit?.number || '';
  }

  const invoice = payment?.invoices?.find(
    (invoice: Invoice) => invoice.id == paymentable.invoice_id
  );

  return invoice?.number || '';
}

export function PaymentOverviewInvoice(props: Props) {
  const [t] = useTranslation();

  const formatMoney = useFormatMoney();

  const colors = useColorScheme();
  const { dateFormat } = useCurrentCompanyDateFormats();

  return (
    <>
      {props.paymentable.invoice_id && (
        <div className="grid grid-cols-1 gap-2 my-2 border py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <span style={{ color: colors.$3 }}>{t('invoice')}</span>

              <Link
                to={route('/invoices/:id/edit', {
                  id: props.paymentable.invoice_id,
                })}
              >
                <div
                  className="flex items-center gap-2"
                  style={{ color: colors.$3, colorScheme: colors.$0 }}
                >
                  <span>{setLabel(props.payment, props.paymentable)}</span>

                  <div>
                    <ExternalLink color="#0062FF" size="1.1rem" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-5">
            <span className="font-mono" style={{ color: colors.$3 }}>
              {formatMoney(
                props?.paymentable?.amount || 0,
                props.payment.client?.country_id,
                props.payment?.currency_id
              )}
            </span>

            <span style={{ color: colors.$3 }}>
              {formatDate(
                new Date(props.paymentable.created_at * 1000).toString(),
                dateFormat
              )}
            </span>

            {props.paymentable.refunded > 0 && (
              <div className="flex items-center space-x-1">
                <span className="font-mono" style={{ color: 'red' }}>
                  {formatMoney(
                    props?.paymentable?.refunded || 0,
                    props.payment.client?.country_id,
                    props.payment?.currency_id
                  )}
                </span>

                <span style={{ color: 'red' }}>{t('refunded')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {props.paymentable.credit_id && (
        <div className="grid grid-cols-1 gap-2 my-2 border py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <span style={{ color: colors.$3 }}>{t('credit')}</span>

              <Link
                to={route('/credits/:id/edit', {
                  id: props.paymentable.credit_id,
                })}
              >
                <div
                  className="flex items-center gap-2"
                  style={{ color: colors.$3, colorScheme: colors.$0 }}
                >
                  <span>
                    {setLabel(props.payment, props.paymentable, true)}
                  </span>

                  <div>
                    <ExternalLink color="#0062FF" size="1.1rem" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-5">
            <span className="font-mono" style={{ color: colors.$3 }}>
              {formatMoney(
                props?.paymentable?.amount || 0,
                props.payment.client?.country_id,
                props.payment?.currency_id
              )}
            </span>

            <span style={{ color: colors.$3 }}>
              {formatDate(
                new Date(props.paymentable.created_at * 1000).toString(),
                dateFormat
              )}
            </span>

            {props.paymentable.refunded > 0 && (
              <div className="flex items-center space-x-1">
                <span className="font-mono" style={{ color: 'red' }}>
                  {formatMoney(
                    props?.paymentable?.refunded || 0,
                    props.payment.client?.country_id,
                    props.payment?.currency_id
                  )}
                </span>

                <span style={{ color: 'red' }}>{t('refunded')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
