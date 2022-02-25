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
import {
  injectBlankItemIntoCurrent,
  setCurrentInvoice,
} from 'common/stores/slices/invoices';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { Actions } from './components/Actions';
import { Client } from './components/clients/Client';
import { Details } from './components/Details';
import { Footer } from './components/Footer';
import { Table } from './components/tables/Table';
import { Totals } from './components/Totals';

export function Create() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  useTitle('new_invoice');

  const pages: BreadcrumRecord[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('new_invoice'),
      href: generatePath('/invoices/create'),
    },
  ];

  const { data } = useQuery('/api/v1/invoices/create', {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.data.data) {
      dispatch(setCurrentInvoice(data.data.data));
      dispatch(injectBlankItemIntoCurrent());
    }
  }, [data]);

  return (
    <Default title={t('new_invoice')} breadcrumbs={pages}>
      <div className="grid grid-cols-12 gap-4">
        <Client />
        <Details />
        <Table />
        <Footer />
        <Totals />
      </div>

      <Actions />

      <div className="py-4">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96" />
      </div>
    </Default>
  );
}
