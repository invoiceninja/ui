/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from 'common/hooks/useQuery';
import { useTitle } from 'common/hooks/useTitle';
import { Invoice } from 'common/interfaces/invoice';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { Client } from './components/clients/Client';
import { Details } from './components/Details';
import { Footer } from './components/Footer';
import { Table } from './components/tables/Table';
import { Totals } from './components/Totals';

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

  const [invoice, setInvoice] = useState<Invoice>();

  const { data } = useQuery('/api/v1/invoices/create', {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setInvoice(data?.data.data || undefined);
  }, [data]);

  return (
    <Default title={t('new_invoice')} breadcrumbs={pages}>
      {invoice && (
        <div className="grid grid-cols-12 gap-4">
          <Client />
          <Details />
          <Table />
          <Footer />
          <Totals />
        </div>
      )}
    </Default>
  );
}
