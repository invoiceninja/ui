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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { StatusBadge } from '$app/components/StatusBadge';
import { useTranslation } from 'react-i18next';
import paymentStatus from '$app/common/constants/payment-status';
import { Payment } from '$app/common/interfaces/payment';
import { PaymentOverviewInvoice } from './PaymentOverviewInvoice';

interface Props {
  payment: Payment;
}

export function PaymentOverview(props: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 my-4">
        <div className="flex items-center justify-center">
          <span className="text-gray-800">
            {`${t('amount')}: ${formatMoney(
              props?.payment?.amount || 0,
              company.settings.country_id ?? '1',
              props.payment?.currency_id ?? '1'
            )}`}
          </span>
        </div>

        <div className="flex items-center justify-center">
          <span className="text-gray-800">
            {`${t('applied')}: ${formatMoney(
              props?.payment?.applied || 0,
              company.settings.country_id ?? '1',
              props.payment?.currency_id ?? '1'
            )}`}
          </span>
        </div>

        <div className="flex items-center justify-center">
          <StatusBadge for={paymentStatus} code={props?.payment?.status_id} />
        </div>

        <div className="flex items-center justify-center">
          <span className="text-gray-800">
            {`${t('refunded')}: ${formatMoney(
              props?.payment?.refunded || 0,
              company.settings.country_id ?? '1',
              props.payment?.currency_id ?? '1'
            )}`}
          </span>
        </div>
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
