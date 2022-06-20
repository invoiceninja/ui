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
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import paymentStatus from 'common/constants/payment-status';
import { Payment } from 'common/interfaces/payment';
import { PaymentOverviewInvoice } from './PaymentOverviewInvoice';

interface Props {
  payment: Payment;
}

export function PaymentOverview(props: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  return (
    <div className="grid grid-cols-2 gap-4 my-4">
      <div className="flex items-center justify-center">
        <span className="text-gray-800">
          {`${t('amount')}: ${formatMoney(
            props?.payment?.amount || 0,
            company.settings.country_id,
            props.payment?.currency_id
          )}`}
        </span>
      </div>

      <div className="flex items-center justify-center">
        <span className="text-gray-800">
          {`${t('applied')}: ${formatMoney(
            props?.payment?.applied || 0,
            company.settings.country_id,
            props.payment?.currency_id
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
            company.settings.country_id,
            props.payment?.currency_id
          )}`}
        </span>
      </div>

      {props.payment.paymentables.map((value) => (
        <PaymentOverviewInvoice
          key={props.payment.id}
          payment={props.payment}
          paymentable={value}
        />
      ))}
    </div>
  );
}
