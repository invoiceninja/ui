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
import { Dispatch, SetStateAction } from 'react';
import { cloneDeep, set } from 'lodash';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { FormikProps } from 'formik';
import { TableNumberInputField } from '../components/TableNumberInputField';

export interface ApplyInvoice {
  _id: string;
  amount: number;
  number: string;
  balance: number;
  invoice_id: string;
}

interface UseApplyInvoiceTableColumnsProps {
  payment: PaymentOnCreation | undefined;
  setPayment?: Dispatch<SetStateAction<PaymentOnCreation | undefined>>;
  errors: ValidationBag | undefined;
  formik?: FormikProps<{ invoices: ApplyInvoice[] }>;
  isApplyPage?: boolean;
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
      column: 'received',
      id: 'id',
      label: t('received'),
      format: (_, invoice) => {
        let invoiceIndex = -1;

        if (isApplyPage) {
          invoiceIndex =
            formik?.values.invoices.findIndex(
              (p) => p.invoice_id === invoice.id
            ) ?? -1;
        } else {
          invoiceIndex =
            payment?.invoices.findIndex((p) => p.invoice_id === invoice.id) ??
            -1;
        }

        return (
          <TableNumberInputField
            value={
              (isApplyPage
                ? formik?.values.invoices.find(
                    (p) => p.invoice_id === invoice.id
                  )?.amount
                : payment?.invoices.find((p) => p.invoice_id === invoice.id)
                    ?.amount) || 0
            }
            onValueChange={(value) => {
              if (invoiceIndex === -1) return;

              setPayment?.((current) => {
                if (current) {
                  const updatedPayment = cloneDeep(current);

                  set(
                    updatedPayment,
                    `invoices.${invoiceIndex}.amount`,
                    isNaN(parseFloat(value)) ? 0 : parseFloat(value)
                  );

                  return updatedPayment;
                }

                return current;
              });

              formik?.setFieldValue(
                `invoices.${invoiceIndex}.amount`,
                parseFloat(value)
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
