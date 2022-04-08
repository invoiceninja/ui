/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceStatus } from 'common/enums/invoice-status';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { openClientPortal } from 'pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import { useHandleArchive } from '../hooks/useHandleArchive';
import { useHandleDelete } from '../hooks/useHandleDelete';
import { useMarkPaid } from '../hooks/useMarkPaid';

export function Actions() {
  const [t] = useTranslation();
  const { id } = useParams();
  const invoice = useCurrentInvoice();
  const downloadPdf = useDownloadPdf();
  const markPaid = useMarkPaid();
  const archive = useHandleArchive();
  const destroy = useHandleDelete();

  return (
    <Dropdown label={t('more_actions')} className="divide-y">
      <div>
        <DropdownElement to={generatePath('/invoices/:id/pdf', { id })}>
          {t('view_pdf')}
        </DropdownElement>

        <DropdownElement onClick={() => invoice && downloadPdf(invoice)}>
          {t('download')}
        </DropdownElement>

        <DropdownElement to={generatePath('/invoices/:id/email', { id })}>
          {t('email_invoice')}
        </DropdownElement>

        {invoice && (
          <DropdownElement onClick={() => openClientPortal(invoice)}>
            {t('client_portal')}
          </DropdownElement>
        )}

        {invoice?.status_id === InvoiceStatus.Sent && (
          <DropdownElement onClick={() => markPaid(invoice)}>
            {t('mark_paid')}
          </DropdownElement>
        )}
      </div>

      <div>
        {invoice && (
          <DropdownElement
            to={generatePath('/invoices/:id/clone', { id: invoice.id })}
          >
            {t('clone_to_invoice')}
          </DropdownElement>
        )}
      </div>

      <div>
        {invoice && (
          <DropdownElement onClick={() => archive(invoice)}>
            {t('archive')}
          </DropdownElement>
        )}

        {invoice && (
          <DropdownElement onClick={() => destroy(invoice)}>
            {t('delete')}
          </DropdownElement>
        )}
      </div>
    </Dropdown>
  );
}
