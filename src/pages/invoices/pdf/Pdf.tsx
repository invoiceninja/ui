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
import { ComboboxAsync } from '$app/components/forms/Combobox';
import { endpoint } from '$app/common/helpers';

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
      topRight={deliveryNote ? <DeliveryNoteDesignSelector /> : null}
    >
      {pdfUrl ? (
        <InvoiceViewer onLink={onLink} link={pdfUrl} method="GET" />
      ) : (
        <Spinner />
      )}
    </Default>
  );
}

function DeliveryNoteDesignSelector() {
  const [t] = useTranslation();

  // Todo: Decide between "Save" or "Auto save" for saving the delivey note design
  // Filter out designs on API based on "entity" in the url
  // Implement on change for delivery note.

  return (
    <ComboboxAsync
      endpoint={new URL(endpoint('/api/v1/designs?entity=invoice'))}
      inputOptions={{
        value: '',
        label: '',
        placeholder: t('select_design') ?? '',
      }}
      entryOptions={{ id: 'id', label: 'name', value: 'id' }}
      onChange={(entry) => console.log(entry)}
    />
  );
}
