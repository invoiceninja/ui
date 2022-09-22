/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { route } from 'common/helpers/route';
import { Invoice } from 'common/interfaces/invoice';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import Toggle from 'components/forms/Toggle';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface Props {
  blobUrl: string;
  onHandleDeliveryNote: (url: string, isDeliveryNote: boolean) => unknown;
  invoice: Invoice;
}

export function Actions(props: Props) {
  const [t] = useTranslation();
  const { id } = useParams();
  const downloadPdf = useDownloadPdf({ resource: 'invoice' });

  const handleDeliveryNoteChange = (value: boolean) =>
    value
      ? props.onHandleDeliveryNote(
          endpoint('/api/v1/invoices/:id/delivery_note?per_page=999999', {
            id,
          }),
          true
        )
      : props.onHandleDeliveryNote(props.blobUrl, false);

  return (
    <>
      <span className="inline-flex items-center">
        <Toggle
          label={t('delivery_note')}
          onChange={handleDeliveryNoteChange}
        />
      </span>

      <Dropdown label={t('more_actions')}>
        <DropdownElement to={route('/invoices/:id/email', { id })}>
          {t('email_invoice')}
        </DropdownElement>

        <DropdownElement onClick={() => downloadPdf(props.invoice)}>
          {t('download')}
        </DropdownElement>
      </Dropdown>
    </>
  );
}
