/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { Invoice } from 'common/interfaces/invoice';
import { useInvoiceQuery } from 'common/queries/invoices';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { InvoiceViewer } from '../common/components/InvoiceViewer';
import { Actions } from './components/Actions';

export function Pdf() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data } = useInvoiceQuery({ id });
  const [pdfUrl, setPdfUrl] = useState<string>();

  useEffect(() => {
    if (data?.data.data) {
      const invoice: Invoice = data.data.data;

      if (invoice.invitations.length > 0) {
        setPdfUrl(
          endpoint('/client/invoice/:invitation/download_pdf', {
            invitation: invoice.invitations[0].key,
          })
        );
      }
    }
  }, [data]);

  return (
    <Default title={t('view_pdf')} navigationTopRight={<Actions />}>
      {pdfUrl ? <InvoiceViewer link={pdfUrl} method="GET" /> : <Spinner />}
    </Default>
  );
}
