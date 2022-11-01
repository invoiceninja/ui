/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { Invoice } from 'common/interfaces/invoice';
import { useInvoiceQuery } from 'common/queries/invoices';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { InvoiceViewer } from '../common/components/InvoiceViewer';
import { useGeneratePdfUrl } from '../common/hooks/useGeneratePdfUrl';
import { Actions } from './components/Actions';

export function Pdf() {
  const { id } = useParams();
  const { data } = useInvoiceQuery({ id });

  const [t] = useTranslation();
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [blobUrl, setBlobUrl] = useState('');
  const [invoice, setInvoice] = useState<Invoice>();

  const url = useGeneratePdfUrl({ resourceType: 'invoice' });

  useEffect(() => {
    if (data) {
      setInvoice(data);
    }
  }, [data]);

  useEffect(() => {
    if (invoice) {
      setPdfUrl(url(invoice));
    }
  }, [invoice]);

  const onLink = (url: string) => setBlobUrl(url);

  return (
    <Default
      title={t('view_pdf')}
      onBackClick={invoice && route('/invoices/:id/edit', { id: invoice.id })}
      navigationTopRight={
        invoice && (
          <Actions
            invoice={invoice}
            blobUrl={blobUrl}
            onHandleDeliveryNote={(value, isDeliveryNote) =>
              isDeliveryNote
                ? setPdfUrl(value)
                : setPdfUrl(url(invoice as Invoice))
            }
          />
        )
      }
    >
      {pdfUrl ? (
        <InvoiceViewer onLink={onLink} link={pdfUrl} method="GET" />
      ) : (
        <Spinner />
      )}
    </Default>
  );
}
