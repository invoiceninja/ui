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
import { MultiValue } from 'react-select';
import { SelectOption } from '$app/components/datatables/Actions';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { CustomMultiSelect } from '$app/components/forms/CustomMultiSelect';
import { useCreditsFilters } from '$app/pages/credits/common/hooks/useCreditsFilters';
import { useExpenseFilters } from '$app/pages/expenses/common/hooks';
import { useInvoiceFilters } from '$app/pages/invoices/common/hooks/useInvoiceFilters';
import { usePaymentFilters } from '$app/pages/payments/common/hooks/usePaymentFilters';
import { usePurchaseOrderFilters } from '$app/pages/purchase-orders/common/hooks';
import { useQuoteFilters } from '$app/pages/quotes/common/hooks';
import { useRecurringInvoiceFilters } from '$app/pages/recurring-invoices/common/hooks';
import { useTaskFilters } from '$app/pages/tasks/common/hooks';
import { Identifier } from '../useReports';

interface Props {
  report: Identifier;
  value?: string;
  onValueChange: (status: string) => void;
  errorMessage?: string[] | string;
}

const EXPENSE_REPORT_STATUSES = [
  'logged',
  'pending',
  'invoiced',
  'paid',
  'unpaid',
];

export function StatusSelector(props: Props) {
  const [t] = useTranslation();

  const { value, onValueChange, errorMessage, report } = props;

  const taskFilters = useTaskFilters();
  const quoteFilters = useQuoteFilters();
  const creditFilters = useCreditsFilters();
  const paymentFilters = usePaymentFilters();
  const invoiceFilters = useInvoiceFilters();
  const expenseFilters = useExpenseFilters();
  const purchaseOrderFilters = usePurchaseOrderFilters();
  const recurringInvoiceFilters = useRecurringInvoiceFilters();

  const handleStatusChange = (
    statuses: MultiValue<{ value: string; label: string }>
  ) =>
    (statuses as SelectOption[])
      .map((option: { value: string; label: string }) => option.value)
      .join(',');

  const getOptions = (): SelectOption[] => {
    if (report === 'invoice' || report === 'invoice_item') {
      return invoiceFilters;
    }

    if (report === 'credit') {
      return creditFilters;
    }

    if (report === 'expense') {
      return expenseFilters.filter((option) =>
        EXPENSE_REPORT_STATUSES.includes(option.value)
      );
    }

    if (report === 'purchase_order' || report === 'purchase_order_item') {
      return purchaseOrderFilters;
    }

    if (report === 'quote' || report === 'quote_item') {
      return quoteFilters;
    }

    if (report === 'recurring_invoice' || report === 'recurring_invoice_item') {
      return recurringInvoiceFilters;
    }

    if (report === 'payment') {
      return paymentFilters;
    }

    if (report === 'task') {
      return taskFilters;
    }

    return [];
  };

  const options = getOptions();

  return (
    <>
      <CustomMultiSelect
        id="statusSelector"
        {...(value && {
          value: options.filter((option) =>
            value.split(',').find((optionValue) => option.value === optionValue)
          ),
        })}
        onValueChange={(options: MultiValue<SelectOption>) =>
          onValueChange(handleStatusChange(options))
        }
        options={options}
      />

      <ErrorMessage className="mt-2">{errorMessage}</ErrorMessage>
    </>
  );
}
