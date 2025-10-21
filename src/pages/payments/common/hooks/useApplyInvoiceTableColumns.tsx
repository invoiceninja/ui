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

export function useApplyInvoiceTableColumns(): DataTableColumns<Invoice> {
  const invoiceColumns = useAllInvoiceColumns();
  type InvoiceColumns = (typeof invoiceColumns)[number];

  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const disableNavigation = useDisableNavigation();

  const formatMoney = useFormatMoney();

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
          invoice.client?.country_id,
          invoice.client?.settings.currency_id
        ),
    },
  ];

  return columns;
}
