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
import { Invoice } from 'common/interfaces/invoice';
import { Divider } from 'components/cards/Divider';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useAtom } from 'jotai';
import { invoiceAtom } from 'pages/invoices/common/atoms';
import { openClientPortal } from 'pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';
import { useHandleArchive } from '../hooks/useHandleArchive';
import { useHandleCancel } from '../hooks/useHandleCancel';
import { useHandleDelete } from '../hooks/useHandleDelete';
import { useHandleRestore } from '../hooks/useHandleRestore';
import { useMarkPaid } from '../hooks/useMarkPaid';
import { useMarkSent } from '../hooks/useMarkSent';

export function useActions() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const downloadPdf = useDownloadPdf({ resource: 'invoice' });
  const markSent = useMarkSent();
  const markPaid = useMarkPaid();

  const archive = useHandleArchive();
  const restore = useHandleRestore();
  const destroy = useHandleDelete();
  const cancel = useHandleCancel();

  const [, setInvoice] = useAtom(invoiceAtom);

  const cloneToInvoice = (invoice: Invoice) => {
    setInvoice({ ...invoice, documents: [], number: '' });
    navigate('/invoices/create');
  };

  return [
    (invoice: Invoice) => (
      <DropdownElement
        to={generatePath('/invoices/:id/email', { id: invoice.id })}
      >
        {t('email_invoice')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement
        to={generatePath('/invoices/:id/pdf', { id: invoice.id })}
      >
        {t('view_pdf')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement onClick={() => downloadPdf(invoice)}>
        {t('download')}
      </DropdownElement>
    ),
    (invoice: Invoice) =>
      invoice.status_id === InvoiceStatus.Draft &&
      !invoice.is_deleted && (
        <DropdownElement onClick={() => markSent(invoice)}>
          {t('mark_sent')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      parseInt(invoice.status_id) < parseInt(InvoiceStatus.Paid) &&
      !invoice.is_deleted && (
        <DropdownElement onClick={() => markPaid(invoice)}>
          {t('mark_paid')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      parseInt(invoice.status_id) < 4 && (
        <DropdownElement
          to={generatePath(
            '/payments/create?invoice=:invoiceId&client=:clientId',
            { invoiceId: invoice.id, clientId: invoice.client_id }
          )}
        >
          {t('enter_payment')}
        </DropdownElement>
      ),
    (invoice: Invoice) => (
      <DropdownElement onClick={() => invoice && openClientPortal(invoice)}>
        {t('client_portal')}
      </DropdownElement>
    ),
    () => <Divider withoutPadding />,
    (invoice: Invoice) => (
      <DropdownElement onClick={() => cloneToInvoice(invoice)}>
        {t('clone_to_invoice')}
      </DropdownElement>
    ),
    // (invoice: Invoice) => (
    //   <DropdownElement
    //     to={generatePath('/invoices/:id/clone/quote', { id: invoice.id })}
    //   >
    //     {t('clone_to_quote')}
    //   </DropdownElement>
    // ),
    // (invoice: Invoice) => (
    //   <DropdownElement
    //     to={generatePath('/invoices/:id/clone/credit', { id: invoice.id })}
    //   >
    //     {t('clone_to_credit')}
    //   </DropdownElement>
    // ),
    // (invoice: Invoice) => (
    //   <DropdownElement
    //     to={generatePath('/invoices/:id/clone/recurring_invoice', {
    //       id: invoice.id,
    //     })}
    //   >
    //     {t('clone_to_recurring')}
    //   </DropdownElement>
    // ),
    () => <Divider withoutPadding />,
    (invoice: Invoice) =>
      invoice.status_id === InvoiceStatus.Sent && (
        <DropdownElement onClick={() => cancel(invoice)}>
          {t('cancel')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      invoice.archived_at === 0 && (
        <DropdownElement onClick={() => archive(invoice)}>
          {t('archive')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      invoice.archived_at > 0 &&
      invoice.status_id !== InvoiceStatus.Cancelled && (
        <DropdownElement onClick={() => restore(invoice)}>
          {t('restore')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      !invoice.is_deleted && (
        <DropdownElement onClick={() => destroy(invoice)}>
          {t('delete')}
        </DropdownElement>
      ),
  ];
}

export function ActionsNext() {
  const { t } = useTranslation();

  const [invoice] = useAtom(invoiceAtom);

  const actions = useActions();

  return (
    <Dropdown label={t('more_actions')}>
      {actions.map(
        (dropdownElement, index) =>
          invoice && (
            <React.Fragment key={index}>
              {dropdownElement(invoice)}
            </React.Fragment>
          )
      )}
    </Dropdown>
  );
}
