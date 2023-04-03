/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { Invoice } from '$app/common/interfaces/invoice';
import { Button } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Icon } from '$app/components/icons/Icon';
import { useDownloadPdf } from '$app/pages/invoices/common/hooks/useDownloadPdf';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDownload, MdSend } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

interface Props {
  blobUrl: string;
  deliveryNote: boolean;
  setDeliveryNote: Dispatch<SetStateAction<boolean>>;
  onHandleDeliveryNote: (url: string, isDeliveryNote: boolean) => unknown;
  invoice: Invoice;
}

export function Actions(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const downloadPdf = useDownloadPdf({ resource: 'invoice' });

  const {
    deliveryNote,
    setDeliveryNote,
    blobUrl,
    invoice,
    onHandleDeliveryNote,
  } = props;

  const handleDeliveryNoteChange = (value: boolean) => {
    setDeliveryNote(value);

    value
      ? onHandleDeliveryNote(
          endpoint('/api/v1/invoices/:id/delivery_note?per_page=999999', {
            id,
          }),
          true
        )
      : onHandleDeliveryNote(blobUrl, false);
  };

  useEffect(() => {
    handleDeliveryNoteChange(deliveryNote);
  }, []);

  return (
    <div className="flex space-x-3">
      <span className="inline-flex items-center">
        <Toggle
          label={t('delivery_note')}
          checked={deliveryNote}
          onChange={handleDeliveryNoteChange}
        />
      </span>

      <Button
        className="flex items-center space-x-1"
        onClick={() =>
          navigate(
            route('/invoices/:id/email', {
              id: invoice.id,
            })
          )
        }
      >
        <Icon element={MdSend} color="white" />
        <span>{t('email_invoice')}</span>
      </Button>

      <Button
        className="flex items-center space-x-1"
        onClick={() => downloadPdf(invoice)}
      >
        <Icon element={MdDownload} color="white" />
        <span>{t('download')}</span>
      </Button>
    </div>
  );
}
