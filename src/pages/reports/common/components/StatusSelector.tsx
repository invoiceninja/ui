/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Alert } from '$app/components/Alert';
import { SelectOption } from '$app/components/datatables/Actions';
import { useInvoiceFilters } from '$app/pages/invoices/common/hooks/useInvoiceFilters';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { Identifier } from '../useReports';
import { useCreditsFilters } from '$app/pages/credits/common/hooks/useCreditsFilters';
import { useExpenseFilters } from '$app/pages/expenses/common/hooks';
import { usePurchaseOrderFilters } from '$app/pages/purchase-orders/common/hooks';
import { useQuoteFilters } from '$app/pages/quotes/common/hooks';
import { useRecurringInvoiceFilters } from '$app/pages/recurring-invoices/common/hooks';
import { usePaymentFilters } from '$app/pages/payments/common/hooks/usePaymentFilters';
import { useTaskFilters } from '$app/pages/tasks/common/hooks';

interface Props {
  report: Identifier;
  value?: string;
  onValueChange: (status: string) => void;
  errorMessage?: string[] | string;
}
export function StatusSelector(props: Props) {
  const [t] = useTranslation();

  const taskFilters = useTaskFilters();
  const quoteFilters = useQuoteFilters();
  const creditFilters = useCreditsFilters();
  const paymentFilters = usePaymentFilters();
  const invoiceFilters = useInvoiceFilters();
  const expenseFilters = useExpenseFilters();
  const purchaseOrderFilters = usePurchaseOrderFilters();
  const recurringInvoiceFilters = useRecurringInvoiceFilters();

  const { value, onValueChange, errorMessage, report } = props;

  const [options, setOptions] = useState<SelectOption[]>([]);

  const customStyles: StylesConfig<SelectOption, true> = {
    multiValue: (styles, { data }) => {
      return {
        ...styles,
        backgroundColor: data.backgroundColor,
        color: data.color,
        borderRadius: '3px',
      };
    },
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: data.color,
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      ':hover': {
        color: 'white',
      },
      color: '#999999',
    }),
  };

  const handleStatusChange = (
    statuses: MultiValue<{ value: string; label: string }>
  ) =>
    (statuses as SelectOption[])
      .map((option: { value: string; label: string }) => option.value)
      .join(',');

  useEffect(() => {
    if (report === 'invoice' || report === 'invoice_item') {
      setOptions(invoiceFilters);
    }

    if (report === 'credit') {
      setOptions(creditFilters);
    }

    if (report === 'expense') {
      setOptions(expenseFilters);
    }

    if (report === 'purchase_order' || report === 'purchase_order_item') {
      setOptions(purchaseOrderFilters);
    }

    if (report === 'quote' || report === 'quote_item') {
      setOptions(quoteFilters);
    }

    if (report === 'recurring_invoice') {
      setOptions(recurringInvoiceFilters);
    }

    if (report === 'payment') {
      setOptions(paymentFilters);
    }

    if (report === 'task') {
      setOptions(taskFilters);
    }
  }, [report]);

  return (
    <>
      <Select
        id="statusSelector"
        styles={customStyles}
        {...(value && {
          value: options.filter((option) =>
            value.split(',').find((optionValue) => option.value === optionValue)
          ),
        })}
        onChange={(options) => onValueChange(handleStatusChange(options))}
        placeholder={t('status')}
        options={options}
        isMulti={true}
      />

      {errorMessage && (
        <Alert className="mt-2" type="danger">
          {errorMessage}
        </Alert>
      )}
    </>
  );
}
