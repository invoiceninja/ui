/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Identifier } from '../useReports';
import { clientMap } from '$app/common/constants/exports/client-map';
import { invoiceMap } from '$app/common/constants/exports/invoice-map';
import { creditMap } from '$app/common/constants/exports/credit-map';
import { quoteMap } from '$app/common/constants/exports/quote-map';
import { paymentMap } from '$app/common/constants/exports/payment-map';
import { vendorMap } from '$app/common/constants/exports/vendor-map';
import { purchaseorderMap } from '$app/common/constants/exports/purchase-order-map';
import { taskMap } from '$app/common/constants/exports/task-map';
import { expenseMap } from '$app/common/constants/exports/expense-map';
import { recurringinvoiceMap } from '$app/common/constants/exports/recurring-invoice-map';
import { contactMap } from '$app/common/constants/exports/contact-map';
import { itemMap } from '$app/common/constants/exports/item-map';

interface GroupByOption {
  value: string;
  label: string;
}

const reportColumnMaps: Record<string, typeof clientMap> = {
  client: clientMap,
  invoice: invoiceMap,
  credit: creditMap,
  quote: quoteMap,
  payment: paymentMap,
  vendor: vendorMap,
  purchase_order: purchaseorderMap,
  task: taskMap,
  expense: expenseMap,
  recurring_invoice: recurringinvoiceMap,
  contact: contactMap,
  item: itemMap,
};

const reportEntityColumns: Record<Identifier, string[]> = {
  activity: [],
  client: ['client'],
  contact: ['contact'],
  credit: ['client', 'credit', 'payment'],
  document: [],
  expense: ['expense', 'client', 'vendor'],
  invoice: ['client', 'invoice', 'payment'],
  invoice_item: ['client', 'invoice', 'payment', 'item'],
  quote: ['client', 'quote'],
  quote_item: ['client', 'quote', 'item'],
  recurring_invoice: ['recurring_invoice', 'client', 'item'],
  recurring_invoice_item: ['client', 'recurring_invoice', 'item'],
  payment: ['client', 'invoice', 'payment'],
  product: [],
  product_sales: [],
  task: ['task', 'client', 'invoice'],
  vendor: ['vendor'],
  purchase_order: ['vendor', 'purchase_order'],
  purchase_order_item: ['vendor', 'purchase_order', 'item'],
  profitloss: [],
  client_balance_report: [],
  client_sales_report: [],
  aged_receivable_detailed_report: [],
  aged_receivable_summary_report: [],
  user_sales_report: [],
  tax_summary_report: [],
  tax_period_report: [],
  project: [],
};

export function useGroupByOptions(identifier: Identifier): GroupByOption[] {
  const { t } = useTranslation();

  return useMemo(() => {
    const entities = reportEntityColumns[identifier] || [];
    const options: GroupByOption[] = [];

    entities.forEach((entity) => {
      const map = reportColumnMaps[entity];

      if (map) {
        map.forEach((record) => {
          const parts = record.value.split('.');
          const label = `${t(parts[0])} - ${t(record.trans)}`;

          options.push({
            value: record.value,
            label,
          });
        });
      }
    });

    return options;
  }, [identifier, t]);
}
