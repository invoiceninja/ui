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
import { Payment } from '$app/common/interfaces/payment';
import { Card } from '$app/components/cards';
import { generatePath } from 'react-router-dom';
import { Badge } from '$app/components/Badge';
import { date } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

interface Props {
  topRight?: ReactNode;
  isEditMode?: boolean;
}

export function RecentPayments({ topRight, isEditMode }: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const disableNavigation = useDisableNavigation();

  const columns: DataTableColumns<Payment> = [
    {
      id: 'number',
      label: t('number'),
      format: (value, payment) => {
        return (
          <DynamicLink
            to={route('/payments/:id/edit', { id: payment.id })}
            renderSpan={disableNavigation('payment', payment)}
          >
            {payment.number}
          </DynamicLink>
        );
      },
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, payment) => (
        <DynamicLink
          to={route('/clients/:id', { id: payment.client_id })}
          renderSpan={disableNavigation('client', payment.client)}
        >
          {payment.client?.display_name}
        </DynamicLink>
      ),
    },
    {
      id: 'invoice_number',
      label: t('invoice'),
      format: (value, payment) =>
        payment.invoices &&
        payment.invoices[0] && (
          <DynamicLink
            to={generatePath('/invoices/:id/edit', {
              id: payment.invoices[0].id,
            })}
            renderSpan={disableNavigation('invoice', payment.invoices[0])}
          >
            {payment.invoices[0].number}
          </DynamicLink>
        ),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value, payment) => (
        <Badge variant="green">
          {formatMoney(
            value,
            payment.client?.country_id,
            payment.client?.settings.currency_id
          )}
        </Badge>
      ),
    },
  ];

  return (
    <Card
      title={t('recent_payments')}
      className="h-full relative"
      withoutBodyPadding
      topRight={topRight}
      renderFromShadcn
    >
      <div
        className="pl-6 pr-4 relative"
        style={{ height: `calc(100% - ${!isEditMode ? '3.7rem' : '4.9rem'}` }}
      >
        <DataTable
          resource="payment"
          columns={columns}
          className="pr-4"
          height="full"
          endpoint="/api/v1/payments?include=client,invoices&sort=date|desc&per_page=50&without_deleted_clients=true&page=1"
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
        />
      </div>
    </Card>
  );
}
