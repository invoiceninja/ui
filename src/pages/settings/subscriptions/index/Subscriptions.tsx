/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { numberFormat } from 'common/helpers/number-format';
import { route } from 'common/helpers/route';
import { Subscription } from 'common/interfaces/subscription';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Settings } from 'components/layouts/Settings';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function Subscriptions() {
  const [t] = useTranslation();
  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('subscriptions'), href: '/settings/subscriptions' },
  ];

  const columns: DataTableColumns<Subscription> = [
    {
      id: 'name',
      label: 'name',
      format: (field, resource) => (
        <Link to={route('/settings/subscriptions/:id', { id: resource.id })}>
          {resource.name}
        </Link>
      ),
    },
    {
      id: 'price',
      label: 'price',
      format: (field, resource) => <div>${numberFormat(resource.price)}</div>,
    },
  ];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('subscriptions')}`;
  });

  return (
    <Settings
      title={t('subscriptions')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#subscriptions"
    >
      <DataTable
        resource="subscription"
        columns={columns}
        endpoint="/api/v1/subscriptions"
        linkToCreate="/settings/subscriptions/create"
        withResourcefulActions
      />
    </Settings>
  );
}
