/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { Client } from './components/clients/Client';
import { Details } from './components/Details';
import { Footer } from './components/Footer';
import { Table } from './components/tables/Table';

export function Create() {
  const [t] = useTranslation();

  useTitle('new_invoice');

  const pages: BreadcrumRecord[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('new_invoice'),
      href: generatePath('/invoices/create'),
    },
  ];

  return (
    <Default title={t('new_invoice')} breadcrumbs={pages}>
      <div className="grid grid-cols-12 gap-4">
        <Client />
        <Details />
        <Table />
        <Footer />
      </div>
    </Default>
  );
}
