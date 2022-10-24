/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { Payment } from 'common/interfaces/payment';
import { Page } from 'components/Breadcrumbs';
import { DataTable } from 'components/DataTable';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { route } from 'common/helpers/route';
import { useEmailPayment } from '../common/hooks/useEmailPayment';
import {
  defaultColumns,
  paymentColumns,
  usePaymentColumns,
} from '../common/hooks/usePaymentColumns';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';

export function Payments() {
  useTitle('payments');

  const [t] = useTranslation();

  const emailPayment = useEmailPayment();

  const pages: Page[] = [{ name: t('payments'), href: '/payments' }];

  const columns = usePaymentColumns();

  const actions = [
    (resource: Payment) =>
      resource.amount - resource.applied > 0 &&
      !resource.is_deleted && (
        <DropdownElement to={route('/payments/:id/apply', { id: resource.id })}>
          {t('apply_payment')}
        </DropdownElement>
      ),
    (resource: Payment) =>
      resource.amount !== resource.refunded &&
      !resource.is_deleted && (
        <DropdownElement
          to={route('/payments/:id/refund', { id: resource.id })}
        >
          {t('refund_payment')}
        </DropdownElement>
      ),
    (resource: Payment) => (
      <DropdownElement onClick={() => emailPayment(resource)}>
        {t('email_payment')}
      </DropdownElement>
    ),
  ];

  return (
    <Default
      title={t('payments')}
      breadcrumbs={pages}
      docsLink="docs/payments/"
    >
      <DataTable
        resource="payment"
        columns={columns}
        endpoint="/api/v1/payments?include=client,invoices"
        linkToCreate="/payments/create"
        bulkRoute="/api/v1/payments/bulk"
        linkToEdit="/payments/:id/edit"
        withResourcefulActions
        customActions={actions}
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={paymentColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="payment"
          />
        }
      />
    </Default>
  );
}
