/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceStatus } from 'common/enums/invoice-status';
import { Divider } from 'components/cards/Divider';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Spinner } from 'components/Spinner';
import { useAtom } from 'jotai';
import { invoiceAtom } from 'pages/invoices/common/atoms';
import { openClientPortal } from 'pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import { useHandleArchive } from '../hooks/useHandleArchive';
import { useHandleCancel } from '../hooks/useHandleCancel';
import { useHandleDelete } from '../hooks/useHandleDelete';
import { useHandleRestore } from '../hooks/useHandleRestore';
import { useMarkPaid } from '../hooks/useMarkPaid';
import { useMarkSent } from '../hooks/useMarkSent';

export function Actions() {
  const [t] = useTranslation();
  const { id } = useParams();
  const [invoice] = useAtom(invoiceAtom);
  const downloadPdf = useDownloadPdf({ resource: 'invoice' });

  const markSent = useMarkSent();
  const markPaid = useMarkPaid();

  const archive = useHandleArchive();
  const restore = useHandleRestore();
  const destroy = useHandleDelete();
  const cancel = useHandleCancel();

  if (!invoice) {
    return <Spinner />;
  }

  return (
    <Dropdown label={t('more_actions')}>
      <DropdownElement to={generatePath('/invoices/:id/email', { id })}>
        {t('email_invoice')}
      </DropdownElement>

      <DropdownElement to={generatePath('/invoices/:id/pdf', { id })}>
        {t('view_pdf')}
      </DropdownElement>

      <DropdownElement onClick={() => downloadPdf(invoice)}>
        {t('download')}
      </DropdownElement>

      {invoice.status_id === InvoiceStatus.Draft && !invoice.is_deleted && (
        <DropdownElement onClick={() => markSent(invoice)}>
          {t('mark_sent')}
        </DropdownElement>
      )}

      {parseInt(invoice.status_id) < parseInt(InvoiceStatus.Paid) &&
        !invoice.is_deleted && (
          <DropdownElement onClick={() => markPaid(invoice)}>
            {t('mark_paid')}
          </DropdownElement>
        )}

      {invoice && parseInt(invoice.status_id) < 4 && (
        <DropdownElement
          to={generatePath(
            '/payments/create?invoice=:invoiceId&client=:clientId',
            { invoiceId: invoice.id, clientId: invoice.client_id }
          )}
        >
          {t('enter_payment')}
        </DropdownElement>
      )}

      <DropdownElement onClick={() => invoice && openClientPortal(invoice)}>
        {t('client_portal')}
      </DropdownElement>

      {invoice && <Divider withoutPadding />}

      <DropdownElement
        to={generatePath('/invoices/:id/clone', { id: invoice.id })}
      >
        {t('clone_to_invoice')}
      </DropdownElement>

      <DropdownElement
        to={generatePath('/invoices/:id/clone/quote', { id: invoice.id })}
      >
        {t('clone_to_quote')}
      </DropdownElement>

      <DropdownElement
        to={generatePath('/invoices/:id/clone/credit', { id: invoice.id })}
      >
        {t('clone_to_credit')}
      </DropdownElement>

      <DropdownElement
        to={generatePath('/invoices/:id/clone/recurring_invoice', {
          id: invoice.id,
        })}
      >
        {t('clone_to_recurring')}
      </DropdownElement>

      <Divider withoutPadding />

      {invoice.status_id === InvoiceStatus.Sent && (
        <DropdownElement onClick={() => cancel(invoice)}>
          {t('cancel')}
        </DropdownElement>
      )}

      {invoice.archived_at === 0 && (
        <DropdownElement onClick={() => archive(invoice)}>
          {t('archive')}
        </DropdownElement>
      )}

      {invoice.archived_at > 0 &&
        invoice.status_id !== InvoiceStatus.Cancelled && (
          <DropdownElement onClick={() => restore(invoice)}>
            {t('restore')}
          </DropdownElement>
        )}

      {!invoice.is_deleted && (
        <DropdownElement onClick={() => destroy(invoice)}>
          {t('delete')}
        </DropdownElement>
      )}
    </Dropdown>
  );
}
