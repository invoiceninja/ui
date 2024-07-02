/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { Tab, Tabs } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';

export default function Invoice() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('edit_invoice');

  const { id } = useParams();

  const pages: Page[] = [
    { name: t('invoices'), href: '/invoices' },
    { name: t('edit_invoice'), href: route('/invoices/:id/edit', { id }) },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/invoices/:id/edit', { id }),
    },
    {
      name: t('e_invoice'),
      href: route('/invoices/:id/e_invoice', { id }),
    },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="space-y-4">
        <Tabs tabs={tabs} />

        <Outlet />
      </div>
    </Default>
  );
}
