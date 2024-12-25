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
import { route } from '$app/common/helpers/route';
import { Invoice } from '$app/common/interfaces/invoice';
import { Card } from '$app/components/cards';
import dayjs from 'dayjs';
import { Badge } from '$app/components/Badge';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { DynamicLink } from '$app/components/DynamicLink';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';
import classNames from 'classnames';

interface Props {
  topRight?: ReactNode;
  isEditMode: boolean;
}

export function PastDueInvoices({ topRight, isEditMode }: Props) {
  const [t] = useTranslation();
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
      className="h-full relative"
      titleDescriptionParentClassName={classNames('drag-handle', {
        'cursor-grab': isEditMode,
      })}
      withoutBodyPadding
      withoutHeaderBorder
      topRight={topRight}
      renderFromShadcn
    >
      <div
        className={classNames('pl-6 pr-4 relative drag-handle', {
          'cursor-grab': isEditMode,
        })}
        style={{
          height: `calc(100% - ${!isEditMode ? '3.7rem' : '4.9rem'}`,
        }}
      >
        <DataTable
          resource="invoice"
          columns={columns}
          className="pr-4"
          height="full"
          endpoint="/api/v1/invoices?include=client.group_settings&overdue=true&without_deleted_clients=true&per_page=50&page=1&sort=due_date|asc"
          withoutActions
          withoutPagination
          withoutPadding
          withoutPerPageAsPreference
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
          withoutSortQueryParameter
        />
      </div>
    </Card>
  );
}
