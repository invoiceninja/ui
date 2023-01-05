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
import { route } from 'common/helpers/route';
import { Credit } from 'common/interfaces/credit';
import { Invoice } from 'common/interfaces/invoice';
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { Quote } from 'common/interfaces/quote';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { Divider } from 'components/cards/Divider';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Icon } from 'components/icons/Icon';
import { useAtom } from 'jotai';
import { creditAtom } from 'pages/credits/common/atoms';
import { invoiceAtom } from 'pages/invoices/common/atoms';
import { openClientPortal } from 'pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { purchaseOrderAtom } from 'pages/purchase-orders/common/atoms';
import { quoteAtom } from 'pages/quotes/common/atoms';
import { recurringInvoiceAtom } from 'pages/recurring-invoices/common/atoms';
import { useTranslation } from 'react-i18next';
import { BiPlusCircle } from 'react-icons/bi';
import {
  MdArchive,
  MdCancel,
  MdCloudCircle,
  MdControlPointDuplicate,
  MdDelete,
  MdDownload,
  MdMarkEmailRead,
  MdPaid,
  MdPictureAsPdf,
  MdRestore,
  MdSend,
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHandleArchive } from '../hooks/useHandleArchive';
import { useHandleCancel } from '../hooks/useHandleCancel';
import { useHandleDelete } from '../hooks/useHandleDelete';
import { useHandleRestore } from '../hooks/useHandleRestore';
import { useMarkPaid } from '../hooks/useMarkPaid';
import { useMarkSent } from '../hooks/useMarkSent';

export function useActions() {
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const downloadPdf = useDownloadPdf({ resource: 'invoice' });
  const markSent = useMarkSent();
  const markPaid = useMarkPaid();

  const archive = useHandleArchive();
  const restore = useHandleRestore();
  const destroy = useHandleDelete();
  const cancel = useHandleCancel();

  const [, setInvoice] = useAtom(invoiceAtom);
  const [, setQuote] = useAtom(quoteAtom);
  const [, setCredit] = useAtom(creditAtom);
  const [, setRecurringInvoice] = useAtom(recurringInvoiceAtom);
  const [, setPurchaseOrder] = useAtom(purchaseOrderAtom);

  const cloneToInvoice = (invoice: Invoice) => {
    setInvoice({ ...invoice, number: '', documents: [] });

    navigate('/invoices/create');
  };

  const cloneToQuote = (invoice: Invoice) => {
    setQuote({ ...(invoice as unknown as Quote), number: '', documents: [] });

    navigate('/quotes/create');
  };

  const cloneToCredit = (invoice: Invoice) => {
    setCredit({ ...(invoice as unknown as Credit), number: '', documents: [] });

    navigate('/credits/create');
  };

  const cloneToRecurringInvoice = (invoice: Invoice) => {
    setRecurringInvoice({
      ...(invoice as unknown as RecurringInvoice),
      number: '',
      documents: [],
    });

    navigate('/recurring_invoices/create');
  };

  const cloneToPurchaseOrder = (invoice: Invoice) => {
    setPurchaseOrder({
      ...(invoice as unknown as PurchaseOrder),
      number: '',
      documents: [],
    });

    navigate('/purchase_orders/create');
  };

  return [
    (invoice: Invoice) => (
      <DropdownElement
        to={route('/invoices/:id/email', { id: invoice.id })}
        icon={<Icon element={MdSend} />}
      >
        {t('email_invoice')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement
        to={route('/invoices/:id/pdf', { id: invoice.id })}
        icon={<Icon element={MdPictureAsPdf} />}
      >
        {t('view_pdf')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement
        onClick={() => downloadPdf(invoice)}
        icon={<Icon element={MdDownload} />}
      >
        {t('download')}
      </DropdownElement>
    ),
    (invoice: Invoice) =>
      invoice.status_id === InvoiceStatus.Draft &&
      !invoice.is_deleted && (
        <DropdownElement
          onClick={() => markSent(invoice)}
          icon={<Icon element={MdMarkEmailRead} />}
        >
          {t('mark_sent')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      parseInt(invoice.status_id) < parseInt(InvoiceStatus.Paid) &&
      !invoice.is_deleted && (
        <DropdownElement
          onClick={() => markPaid(invoice)}
          icon={<Icon element={MdPaid} />}
        >
          {t('mark_paid')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      parseInt(invoice.status_id) < 4 && (
        <DropdownElement
          to={route('/payments/create?invoice=:invoiceId&client=:clientId', {
            invoiceId: invoice.id,
            clientId: invoice.client_id,
          })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('enter_payment')}
        </DropdownElement>
      ),
    (invoice: Invoice) => (
      <DropdownElement
        onClick={() => invoice && openClientPortal(invoice)}
        icon={<Icon element={MdCloudCircle} />}
      >
        {t('client_portal')}
      </DropdownElement>
    ),
    (invoice: Invoice) =>
      invoice.status_id === InvoiceStatus.Sent && (
        <DropdownElement
          onClick={() => cancel(invoice)}
          icon={<Icon element={MdCancel} />}
        >
          {t('cancel_invoice')}
        </DropdownElement>
      ),
    () => <Divider withoutPadding />,
    (invoice: Invoice) => (
      <DropdownElement
        onClick={() => cloneToInvoice(invoice)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone_to_invoice')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement
        onClick={() => cloneToQuote(invoice)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone_to_quote')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement
        onClick={() => cloneToCredit(invoice)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone_to_credit')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement
        onClick={() => cloneToRecurringInvoice(invoice)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone_to_recurring')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement
        onClick={() => cloneToPurchaseOrder(invoice)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone_to_purchase_order')}
      </DropdownElement>
    ),
    () => location.pathname.endsWith('/edit') && <Divider withoutPadding />,
    (invoice: Invoice) =>
      location.pathname.endsWith('/edit') &&
      invoice.archived_at === 0 && (
        <DropdownElement
          onClick={() => archive(invoice)}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      location.pathname.endsWith('/edit') &&
      invoice.archived_at > 0 &&
      invoice.status_id !== InvoiceStatus.Cancelled && (
        <DropdownElement
          onClick={() => restore(invoice)}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      location.pathname.endsWith('/edit') &&
      !invoice.is_deleted && (
        <DropdownElement
          onClick={() => destroy(invoice)}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];
}
