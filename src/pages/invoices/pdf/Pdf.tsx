/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from '$app/common/interfaces/invoice';
import { useInvoiceQuery } from '$app/common/queries/invoices';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { InvoiceViewer } from '../common/components/InvoiceViewer';
import { useGeneratePdfUrl } from '../common/hooks/useGeneratePdfUrl';
import { Actions } from './components/Actions';

export default function Pdf() {
  const { id } = useParams();
  const { data } = useInvoiceQuery({ id });

  const [t] = useTranslation();
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [blobUrl, setBlobUrl] = useState('');
  const [invoice, setInvoice] = useState<Invoice>();

  const [deliveryNote, setDeliveryNote] = useState<boolean>(false);

  const [searchParams] = useSearchParams();

  const url = useGeneratePdfUrl({ resourceType: 'invoice' });

  useEffect(() => {
    if (data) {
      setInvoice(data);

      if (searchParams.has('delivery_note')) {
        setDeliveryNote(true);
      }
    }
  }, [data]);

  useEffect(() => {
    if (invoice && !searchParams.has('delivery_note')) {
      setPdfUrl(url(invoice));
    }
  }, [invoice]);

  const onLink = (url: string) => setBlobUrl(url);

  return (
    <Default
      title={t('view_pdf')}
      navigationTopRight={
        invoice && (
          <Actions
            invoice={invoice}
            blobUrl={blobUrl}
            deliveryNote={deliveryNote}
            setDeliveryNote={setDeliveryNote}
            onHandleDeliveryNote={(value, isDeliveryNote = deliveryNote) =>
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
        <div
          className="flex justify-center items-center"
          style={{ height: 1500 }}
        >
          <Spinner />
        </div>
      )}
    </Default>
  );
}
