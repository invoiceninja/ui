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
import { Payment } from '$app/common/interfaces/payment';
import { PaymentOverviewInvoice } from './PaymentOverviewInvoice';
import { PaymentStatus } from '../common/components/PaymentStatus';
import { useColorScheme } from '$app/common/colors';

interface Props {
  payment: Payment;
}

export function PaymentOverview(props: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();
  const colors = useColorScheme();

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 pt-6">
        <div className="flex space-x-2 items-center justify-center">
          <span className="font-medium" style={{ color: colors.$3 }}>
            {t('amount')}:
          </span>

          <span className="font-medium font-mono" style={{ color: colors.$3 }}>
            {formatMoney(
              props?.payment?.amount || 0,
              props.payment.client?.country_id,
              props.payment?.currency_id
            )}
          </span>
        </div>

        <div className="flex space-x-2 items-center justify-center">
          <span className="font-medium" style={{ color: colors.$3 }}>
            {t('applied')}:
          </span>

          <span className="font-medium font-mono" style={{ color: colors.$3 }}>
            {formatMoney(
              props?.payment?.applied || 0,
              props.payment.client?.country_id,
              props.payment?.currency_id
            )}
          </span>
        </div>

        <div className="flex items-center justify-center">
          <PaymentStatus entity={props.payment} />
        </div>

        <div className="flex space-x-2 items-center justify-center">
          <span className="font-medium" style={{ color: colors.$3 }}>
            {t('refunded')}:
          </span>

          <span className="font-medium font-mono" style={{ color: colors.$3 }}>
            {formatMoney(
              props?.payment?.refunded || 0,
              props.payment.client?.country_id,
              props.payment?.currency_id
            )}
          </span>
        </div>

        {props?.payment?.applied < props?.payment?.amount && (
          <>
            <div className="flex space-x-2 items-center justify-center">
              <span className="font-medium" style={{ color: colors.$3 }}>
                {t('unapplied')}:
              </span>

              <span
                className="font-medium font-mono"
                style={{ color: colors.$3 }}
              >
                {formatMoney(
                  props?.payment?.amount - props?.payment?.applied || 0,
                  props.payment.client?.country_id,
                  props.payment?.currency_id
                )}
              </span>
            </div>
          </>
        )}
      </div>

      <div>
        {props.payment.paymentables.map((value) => (
          <PaymentOverviewInvoice
            key={value.id}
            payment={props.payment}
            paymentable={value}
          />
        ))}
      </div>
    </div>
  );
}
