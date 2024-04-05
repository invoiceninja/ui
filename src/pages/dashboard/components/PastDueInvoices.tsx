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
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { t } from 'i18next';
import { route } from '$app/common/helpers/route';
import { Invoice } from '$app/common/interfaces/invoice';
import { Card } from '$app/components/cards';
import dayjs from 'dayjs';
import { Badge } from '$app/components/Badge';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { DynamicLink } from '$app/components/DynamicLink';

export function PastDueInvoices() {
  const formatMoney = useFormatMoney();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const disableNavigation = useDisableNavigation();

  const columns: DataTableColumns<Invoice> = [
    {
      id: 'number',
      label: t('number'),
      format: (value, invoice) => {
        return (
          <DynamicLink
            to={route('/invoices/:id/edit', { id: invoice.id })}
            renderSpan={disableNavigation('invoice', invoice)}
          >
            {invoice.number}
          </DynamicLink>
        );
      },
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, invoice) => (
        <DynamicLink
          to={route('/clients/:id', { id: invoice.client_id })}
          renderSpan={disableNavigation('client', invoice.client)}
        >
          {invoice.client?.display_name}
        </DynamicLink>
      ),
    },
    {
      id: 'due_date',
      label: t('due_date'),
      format: (value, invoice) =>
        value && invoice.partial_due_date.length > 2
          ? dayjs(invoice.partial_due_date).format(dateFormat)
          : dayjs(value).format(dateFormat),
    },
    {
      id: 'balance',
      label: t('balance'),
      format: (value, invoice) => (
        <Badge variant="red">
          {formatMoney(
            value,
            invoice.client?.country_id,
            invoice.client?.settings.currency_id
          )}
        </Badge>
      ),
    },
  ];

  return (
    <Card
      title={t('past_due_invoices')}
      className="h-96 relative"
      withoutBodyPadding
      withoutHeaderBorder
    >
      <div className="pl-6 pr-4">
        <DataTable
          resource="invoice"
          columns={columns}
          className="pr-4"
          endpoint="/api/v1/invoices?include=client.group_settings&overdue=true&without_deleted_clients=true&per_page=50&page=1&sort=id|desc"
          withoutActions
          withoutPagination
          withoutPadding
          styleOptions={{
            addRowSeparator: true,
            withoutBottomBorder: true,
            withoutTopBorder: true,
            withoutLeftBorder: true,
            withoutRightBorder: true,
            headerBackgroundColor: 'transparent',
            thChildrenClassName: 'text-gray-500 dark:text-white',
            tdClassName: 'first:pl-0 py-4',
            thClassName: 'first:pl-0',
            tBodyStyle: { border: 0 },
          }}
          style={{
            height: '19.9rem',
          }}
        />
      </div>
    </Card>
  );
}
