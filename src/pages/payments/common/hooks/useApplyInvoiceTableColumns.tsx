/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Invoice } from '$app/common/interfaces/invoice';
import { DataTableColumns } from '$app/components/DataTable';
import { useTranslation } from 'react-i18next';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import {
  DataTableColumnsExtended,
  useAllInvoiceColumns,
} from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { PaymentOnCreation } from '../..';
import { Dispatch, SetStateAction, useState } from 'react';
import { cloneDeep, set } from 'lodash';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { FormikProps } from 'formik';
import { TableNumberInputField } from '../components/TableNumberInputField';
import { Checkbox } from '$app/components/forms';
import dayjs from 'dayjs';

export interface ApplyInvoice {
  _id: string;
  amount: number;
  cash_discount?: number;
  invoice_id: string;
  credit_id?: string;
}

interface UseApplyInvoiceTableColumnsProps {
  payment: PaymentOnCreation | undefined;
  setPayment?: Dispatch<SetStateAction<PaymentOnCreation | undefined>>;
  errors: ValidationBag | undefined;
  formik?: FormikProps<{ invoices: ApplyInvoice[] }>;
  isApplyPage?: boolean;
}

export function isCashDiscountExpired(invoice: Invoice) {
  if (!invoice.cash_discount_expiry_date) {
    return false;
  }

  return dayjs().isAfter(invoice.cash_discount_expiry_date, 'day');
}

interface CashDiscountCellProps {
  paymentInvoice: ApplyInvoice | undefined;
  invoice: Invoice;
  invoiceIndex: number;
  errors: ValidationBag | undefined;
  onValueChange: (value: string, checked: boolean) => unknown;
  onCheckedChange: (checked: boolean, cashDiscount: number) => unknown;
}

function CashDiscountCell({
  paymentInvoice,
  invoice,
  invoiceIndex,
  errors,
  onValueChange,
  onCheckedChange,
}: CashDiscountCellProps) {
  const [checked, setChecked] = useState(
    () => Boolean(invoice.cash_discount) && !isCashDiscountExpired(invoice)
  );
  const isSelected = invoiceIndex !== -1;
  const cashDiscount =
    paymentInvoice?.cash_discount ?? invoice.cash_discount ?? 0;

  return (
    <div className="flex items-start gap-x-2">
      <div className="pt-2">
        <Checkbox
          checked={checked}
          onValueChange={(_, checked) => {
            const isChecked = Boolean(checked);

            setChecked(isChecked);
            onCheckedChange(isChecked, cashDiscount);
          }}
          disabled={!isSelected}
        />
      </div>
      <TableNumberInputField
        disabled={!checked || !isSelected}
        value={cashDiscount}
        onValueChange={(value) => onValueChange(value, checked)}
        errorMessage={[
          ...(errors?.errors[`invoices.${invoiceIndex}.cash_discount`] || []),
        ]}
      />
    </div>
  );
}

export function useApplyInvoiceTableColumns({
  payment,
  setPayment,
  errors,
  formik,
  isApplyPage = false,
}: UseApplyInvoiceTableColumnsProps): DataTableColumns<Invoice> {
  const invoiceColumns = useAllInvoiceColumns();
  type InvoiceColumns = (typeof invoiceColumns)[number];

  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const disableNavigation = useDisableNavigation();

  const getSelectedInvoiceIndex = (invoiceId: string): number => {
    return isApplyPage
      ? (formik?.values.invoices.findIndex((p) => p.invoice_id === invoiceId) ??
          -1)
      : (payment?.invoices.findIndex((p) => p.invoice_id === invoiceId) ?? -1);
  };

  const getPaymentInvoice = (invoiceId: string): ApplyInvoice | undefined => {
    return isApplyPage
      ? formik?.values.invoices.find((p) => p.invoice_id === invoiceId)
      : payment?.invoices.find((p) => p.invoice_id === invoiceId);
  };

  const updatePaymentInvoice = (
    invoiceIndex: number,
    field: 'cash_discount' | 'amount',
    value: number
  ) => {
    if (invoiceIndex === -1) return;

    setPayment?.((current) => {
      if (current) {
        const updatedPayment = cloneDeep(current);

        set(updatedPayment, `invoices.${invoiceIndex}.${field}`, value);

        return updatedPayment;
      }

      return current;
    });

    formik?.setFieldValue(`invoices.${invoiceIndex}.${field}`, value);
  };

  const columns: DataTableColumnsExtended<Invoice, InvoiceColumns> = [
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (value, invoice) => (
        <DynamicLink
          to={route('/invoices/:id/edit', { id: invoice.id })}
          renderSpan={disableNavigation('invoice', invoice)}
        >
          {value}
        </DynamicLink>
      ),
    },
    {
      column: 'date',
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'balance',
      id: 'balance',
      label: t('balance'),
      format: (value, invoice) =>
        formatMoney(
          value,
          invoice?.client?.country_id,
          invoice?.client?.settings.currency_id
        ),
    },
    {
      column: 'cash_discount',
      id: 'cash_discount',
      label: t('cash_discount'),
      format: (_, invoice) => {
        const invoiceIndex = getSelectedInvoiceIndex(invoice.id);
        const paymentInvoice = getPaymentInvoice(invoice.id);
        const amount = paymentInvoice?.amount || 0;
        const cashDiscount =
          paymentInvoice?.cash_discount ?? invoice.cash_discount ?? 0;

        return (
          <CashDiscountCell
            paymentInvoice={paymentInvoice}
            invoice={invoice}
            invoiceIndex={invoiceIndex}
            errors={errors}
            onValueChange={(value: string, checked: boolean) => {
              const nextCashDiscount = isNaN(parseFloat(value))
                ? 0
                : parseFloat(value);

              updatePaymentInvoice(
                invoiceIndex,
                'cash_discount',
                nextCashDiscount
              );

              if (checked) {
                const baseAmount = amount + cashDiscount;
                const nextAmount = Math.max(baseAmount - nextCashDiscount, 0);

                updatePaymentInvoice(invoiceIndex, 'amount', nextAmount);
              }
            }}
            onCheckedChange={(checked, cashDiscount) => {
              const nextAmount = checked
                ? Math.max(amount - cashDiscount, 0)
                : Math.min(
                    amount + cashDiscount,
                    invoice.balance ? invoice.balance : Infinity
                  );

              updatePaymentInvoice(invoiceIndex, 'amount', nextAmount);
            }}
          />
        );
      },
    },
    {
      column: 'received',
      id: 'id',
      label: t('received'),
      format: (_, invoice) => {
        const invoiceIndex = getSelectedInvoiceIndex(invoice.id);

        return (
          <TableNumberInputField
            value={getPaymentInvoice(invoice.id)?.amount || 0}
            onValueChange={(value) => {
              updatePaymentInvoice(
                invoiceIndex,
                'amount',
                isNaN(parseFloat(value)) ? 0 : parseFloat(value)
              );
            }}
            disabled={invoiceIndex === -1}
            errorMessage={[
              ...(errors?.errors[`invoices.${invoiceIndex}.amount`] || []),
              ...(errors?.errors[`invoices.${invoiceIndex}.invoice_id`] || []),
            ]}
          />
        );
      },
    },
  ];

  return columns;
}
