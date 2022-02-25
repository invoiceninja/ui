/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { useQuery } from 'common/hooks/useQuery';
import { useTitle } from 'common/hooks/useTitle';
import { defaultHeaders } from 'common/queries/common/headers';
import {
  injectBlankItemIntoCurrent,
  setCurrentInvoice,
} from 'common/stores/slices/invoices';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect, useRef } from 'react';
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
  const invoice = useCurrentInvoice();
  const iframeRef = useRef<HTMLIFrameElement>();

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

  useEffect(() => {
    if (invoice?.client_id) {
      axios
        .post(
          endpoint('/api/v1/live_preview?entity=invoice'),
          { ...invoice },
          { headers: defaultHeaders }
        )
        .then((response) => {
          const file = new Blob([response.data], { type: 'application/pdf' });
          const fileUrl = URL.createObjectURL(file);

          iframeRef.current?.setAttribute('src', fileUrl);
        })
        .catch((error) => console.log(error));
    }
  }, [invoice]);

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
        <iframe
          ref={iframeRef}
          width="100%"
          height="1200"
          typeof="application/pdf"
        />
      </div>
    </Default>
  );
}
