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
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import Toggle from '$app/components/forms/Toggle';
import { Icon } from '$app/components/icons/Icon';
import { useDownloadPdf } from '$app/pages/invoices/common/hooks/useDownloadPdf';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDownload, MdSend } from 'react-icons/md';
import { useParams } from 'react-router-dom';

interface Props {
  blobUrl: string;
  deliveryNote: boolean;
  setDeliveryNote: Dispatch<SetStateAction<boolean>>;
  onHandleDeliveryNote: (url: string, isDeliveryNote: boolean) => unknown;
  invoice: Invoice;
}

export function Actions(props: Props) {
  const [t] = useTranslation();

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
    <>
      <span className="inline-flex items-center">
        <Toggle
          label={t('delivery_note')}
          checked={deliveryNote}
          onChange={handleDeliveryNoteChange}
        />
      </span>

      <Dropdown label={t('more_actions')}>
        <DropdownElement
          to={route('/invoices/:id/email', { id })}
          icon={<Icon element={MdSend} />}
        >
          {t('email_invoice')}
        </DropdownElement>

        <DropdownElement
          onClick={() => downloadPdf(invoice)}
          icon={<Icon element={MdDownload} />}
        >
          {t('download')}
        </DropdownElement>
      </Dropdown>
    </>
  );
}
