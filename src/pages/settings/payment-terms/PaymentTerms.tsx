/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Settings } from '$app/components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { Link } from '$app/components/forms';
import { route } from '$app/common/helpers/route';
import { PaymentTerm } from '$app/common/interfaces/payment-term';

export function PaymentTerms() {
  const { documentTitle } = useTitle('payment_terms');
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('payment_settings'), href: '/settings/online_payments' },
    { name: t('payment_terms'), href: '/settings/payment_terms' },
  ];

  const columns: DataTableColumns<PaymentTerm> = [
    {
      id: 'name',
      label: t('number_of_days'),
      format: (value, paymentTerm) => (
        <Link
          to={route('/settings/payment_terms/:id/edit', {
            id: paymentTerm.id,
          })}
        >
          {value}
        </Link>
      ),
    },
  ];

  return (
    <Settings breadcrumbs={pages} title={documentTitle}>
      <DataTable
        endpoint="/api/v1/payment_terms?sort=id|desc"
        bulkRoute="/api/v1/payment_terms/bulk"
        resource="payment_term"
        columns={columns}
        linkToCreate="/settings/payment_terms/create"
        linkToEdit="/settings/payment_terms/:id/edit"
        withResourcefulActions
        enableSavingFilterPreference
      />
    </Settings>
  );
}
