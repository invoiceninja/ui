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
import { useColorScheme } from '$app/common/colors';
import { CreditCardChecked } from '$app/components/icons/CreditCardChecked';
import { ArrowUp } from '$app/components/icons/ArrowUp';
import { ArrowDown } from '$app/components/icons/ArrowDown';

export function RecentPayments() {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();

  const colors = useColorScheme();

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
        <Badge variant="green" className="font-mono">
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
      title={
        <div className="flex items-center gap-2">
          <CreditCardChecked size="1.4rem" color="#22C55E" />

          <span>{t('recent_payments')}</span>
        </div>
      }
      className="h-96 relative shadow-sm"
      headerClassName="px-3 sm:px-4 py-3 sm:py-4"
      withoutBodyPadding
      style={{ borderColor: colors.$5 }}
      headerStyle={{ borderColor: colors.$5 }}
      withoutHeaderPadding
    >
      <div className="px-4 pt-4">
        <DataTable
          resource="payment"
          columns={columns}
          className="pr-4"
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
            disableThUppercase: true,
            withoutThVerticalPadding: true,
            useOnlyCurrentSortDirectionIcon: true,
            headerBackgroundColor: 'transparent',
            thChildrenClassName: 'text-gray-500',
            tdClassName: 'first:pl-2 py-3',
            thClassName: 'first:pl-2 py-3 border-r-0 text-sm',
            tBodyStyle: { border: 0 },
            thTextSize: 'small',
            thStyle: {
              borderBottom: `1px solid ${colors.$5}`,
            },
            rowSeparatorColor: colors.$5,
            ascIcon: <ArrowUp size="1.1rem" color="#6b7280" />,
            descIcon: <ArrowDown size="1.1rem" color="#6b7280" />,
          }}
          style={{
            height: '18.9rem',
          }}
        />
      </div>
    </Card>
  );
}
