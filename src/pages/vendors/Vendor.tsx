/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useVendorQuery } from 'common/queries/vendor';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Outlet, useParams } from 'react-router-dom';

export function Vendor() {
  const { id } = useParams();
  const [t] = useTranslation();
  const [documentTitle, setdocumentTitle] = useState('');
  const { data: vendor } = useVendorQuery({ id });

  const tabs: Tab[] = [
    { name: t('details'), href: generatePath('/vendors/:id/edit', { id }) },
    {
      name: t('expenses'),
      href: generatePath('/vendors/:id/expenses', { id }),
    },
    {
      name: t('recurring_expenses'),
      href: generatePath('/vendors/:id/recurring_expenses', { id }),
    },
    {
      name: t('custom_fields'),
      href: generatePath('/vendors/:id/vendor_fields', { id }),
    },
  ];

  const pages: BreadcrumRecord[] = [
    { name: t('vendors'), href: '/vendors' },
    {
      name: documentTitle,
      href: generatePath('/vendors/:id', { id }),
    },
  ];

  useEffect(() => {
    setdocumentTitle(vendor?.data.data.name || t('vendor'));
  }, [vendor?.data.data]);

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <Container>
        <Tabs tabs={tabs} />
        <Outlet />
      </Container>
    </Default>
  );
}
