/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useSumTableColumn } from '$app/common/hooks/useSumTableColumn';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { DataTableFooterColumnsExtended } from '$app/pages/invoices/common/hooks/useFooterColumns';
import { useAllPaymentColumns } from './usePaymentColumns';
import { Payment } from '$app/common/interfaces/payment';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';

export function useFooterColumns() {
  const [t] = useTranslation();

  const reactSettings = useReactSettings();

  const sumTableColumn = useSumTableColumn();
  const resolveCurrency = useResolveCurrency();
  const paymentColumns = useAllPaymentColumns();

  type PaymentColumns = (typeof paymentColumns)[number];

  const calculateConvertedAmount = (payment: Payment) => {
    if (payment.exchange_rate) {
      return payment.amount * payment.exchange_rate;
    }

    if (payment.client && payment.client.settings.currency_id?.length > 1) {
      const currency = resolveCurrency(payment.currency_id);

      if (currency) {
        return payment.amount * currency.exchange_rate;
      }
    }

    return payment.amount;
  };

  const columns: DataTableFooterColumnsExtended<Payment, PaymentColumns> = [
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (values, payments) =>
        sumTableColumn(values as number[], payments),
    },
    {
      column: 'converted_amount',
      id: 'converted_amount' as keyof Payment,
      label: t('converted_amount'),
      format: (values, payments) =>
        sumTableColumn(
          payments.map((payment) => calculateConvertedAmount(payment)),
          payments
        ),
    },
  ];

  const currentColumns = reactSettings?.table_footer_columns?.payment || [];

  return {
    footerColumns: columns.filter(({ id }) => currentColumns.includes(id)),
    allFooterColumns: columns,
  };
}
