/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceStatus } from '$app/common/enums/invoice-status';
import { route } from '$app/common/helpers/route';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useAtom } from 'jotai';
import { creditAtom } from '$app/pages/credits/common/atoms';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { openClientPortal } from '$app/pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from '$app/pages/invoices/common/hooks/useDownloadPdf';
import { purchaseOrderAtom } from '$app/pages/purchase-orders/common/atoms';
import { quoteAtom } from '$app/pages/quotes/common/atoms';
import { recurringInvoiceAtom } from '$app/pages/recurring-invoices/common/atoms';
import { useTranslation } from 'react-i18next';
import { BiMoney, BiPlusCircle } from 'react-icons/bi';
import {
  MdArchive,
  MdCancel,
  MdCloudCircle,
  MdControlPointDuplicate,
  MdDelete,
  MdDownload,
  MdEdit,
  MdMarkEmailRead,
  MdPaid,
  MdPictureAsPdf,
  MdPrint,
  MdRefresh,
  MdRestore,
  MdSchedule,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useScheduleEmailRecord } from '$app/pages/invoices/common/hooks/useScheduleEmailRecord';
import { usePrintPdf } from '$app/pages/invoices/common/hooks/usePrintPdf';
import { getEntityState } from '$app/common/helpers';
import { EntityState } from '$app/common/enums/entity-state';
import dayjs from 'dayjs';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { useBulk } from '$app/common/queries/invoices';
import { useReverseInvoice } from '../../common/hooks/useReverseInvoice';
import { EmailInvoiceAction } from '../../common/components/EmailInvoiceAction';
import { useShowActionByPreferences } from '$app/common/hooks/useShowActionByPreferences';
import {
  useAdmin,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';

export const isInvoiceAutoBillable = (invoice: Invoice) => {
  return (
    invoice.balance > 0 &&
    (invoice.status_id === InvoiceStatus.Sent ||
      invoice.status_id === InvoiceStatus.Partial) &&
    Boolean(invoice.client?.gateway_tokens.length)
  );
};

interface Params {
  showEditAction?: boolean;
  showCommonBulkAction?: boolean;
  dropdown?: boolean;
}
export function useActions(params?: Params) {
  const { t } = useTranslation();

  const hasPermission = useHasPermission();

  const { isAdmin, isOwner } = useAdmin();

  const {
    showEditAction,
    showCommonBulkAction,
    dropdown = true,
  } = params || {};

  const navigate = useNavigate();
  const downloadPdf = useDownloadPdf({ resource: 'invoice' });
  const printPdf = usePrintPdf({ entity: 'invoice' });
  const scheduleEmailRecord = useScheduleEmailRecord({ entity: 'invoice' });

  const reverseInvoice = useReverseInvoice();

  const showActionByPreferences = useShowActionByPreferences({
    commonActionsSection: Boolean(!dropdown),
    entity: 'invoice',
  });

  const bulk = useBulk();

  const { isEditPage } = useEntityPageIdentifier({ entity: 'invoice' });

  const [, setInvoice] = useAtom(invoiceAtom);
  const [, setQuote] = useAtom(quoteAtom);
  const [, setCredit] = useAtom(creditAtom);
  const [, setRecurringInvoice] = useAtom(recurringInvoiceAtom);
  const [, setPurchaseOrder] = useAtom(purchaseOrderAtom);

  const cloneToInvoice = (invoice: Invoice) => {
    setInvoice({
      ...invoice,
      id: '',
      number: '',
      documents: [],
      due_date: '',
      date: dayjs().format('YYYY-MM-DD'),
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '',
      vendor_id: '',
      paid_to_date: 0,
    });

    navigate('/invoices/create?action=clone');
  };

  const cloneToQuote = (invoice: Invoice) => {
    setQuote({
      ...(invoice as unknown as Quote),
      id: '',
      number: '',
      documents: [],
      date: dayjs().format('YYYY-MM-DD'),
      due_date: '',
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '',
      vendor_id: '',
      paid_to_date: 0,
    });

    navigate('/quotes/create?action=clone');
  };

  const cloneToCredit = (invoice: Invoice) => {
    setCredit({
      ...(invoice as unknown as Credit),
      id: '',
      number: '',
      documents: [],
      date: dayjs().format('YYYY-MM-DD'),
      due_date: '',
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '',
      vendor_id: '',
      paid_to_date: 0,
    });

    navigate('/credits/create?action=clone');
  };

  const cloneToRecurringInvoice = (invoice: Invoice) => {
    setRecurringInvoice({
      ...(invoice as unknown as RecurringInvoice),
      id: '',
      number: '',
      documents: [],
      frequency_id: '5',
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '',
      vendor_id: '',
      paid_to_date: 0,
    });

    navigate('/recurring_invoices/create?action=clone');
  };

  const cloneToPurchaseOrder = (invoice: Invoice) => {
    setPurchaseOrder({
      ...(invoice as unknown as PurchaseOrder),
      id: '',
      number: '',
      documents: [],
      date: dayjs().format('YYYY-MM-DD'),
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '1',
      vendor_id: '',
      paid_to_date: 0,
    });

    navigate('/purchase_orders/create?action=clone');
  };

  return [
    (invoice: Invoice) =>
      Boolean(showEditAction) && (
        <DropdownElement
          to={route('/invoices/:id/edit', { id: invoice.id })}
          icon={<Icon element={MdEdit} />}
        >
          {t('edit')}
        </DropdownElement>
      ),
    () => Boolean(showEditAction) && dropdown && <Divider withoutPadding />,
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'email_invoice') && (
        <EmailInvoiceAction
          {...(!dropdown && {
            key: 'email_invoice',
          })}
          invoice={invoice}
          dropdown={dropdown}
        />
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'view_pdf') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('view_pdf'),
            key: 'view_pdf',
          })}
          to={route('/invoices/:id/pdf', { id: invoice.id })}
          icon={
            <Icon element={MdPictureAsPdf} {...(!dropdown && { size: 23.5 })} />
          }
        >
          {t('view_pdf')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      getEntityState(invoice) !== EntityState.Deleted &&
      showActionByPreferences('invoice', 'print_pdf') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('print_pdf'),
            key: 'print_pdf',
          })}
          onClick={() => printPdf([invoice.id])}
          icon={<Icon element={MdPrint} {...(!dropdown && { size: 23.5 })} />}
        >
          {t('print_pdf')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      invoice.status_id !== InvoiceStatus.Paid &&
      showActionByPreferences('invoice', 'schedule') &&
      (isAdmin || isOwner) && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('schedule'),
            key: 'schedule',
          })}
          onClick={() => scheduleEmailRecord(invoice.id)}
          icon={
            <Icon element={MdSchedule} {...(!dropdown && { size: 23.5 })} />
          }
        >
          {t('schedule')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'delivery_note') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: `${t('delivery_note')} ${t('pdf')}`,
            key: 'delivery_note',
          })}
          to={route('/invoices/:id/pdf?delivery_note=true', { id: invoice.id })}
          icon={
            <Icon element={MdPictureAsPdf} {...(!dropdown && { size: 23.5 })} />
          }
        >
          {t('delivery_note')} ({t('pdf')})
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'download') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('download'),
            key: 'download',
          })}
          onClick={() => downloadPdf(invoice)}
          icon={
            <Icon element={MdDownload} {...(!dropdown && { size: 23.5 })} />
          }
        >
          {t('download')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      invoice.status_id === InvoiceStatus.Draft &&
      !invoice.is_deleted &&
      showActionByPreferences('invoice', 'mark_sent') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('mark_sent'),
            key: 'mark_sent',
          })}
          onClick={() => bulk([invoice.id], 'mark_sent')}
          icon={
            <Icon
              element={MdMarkEmailRead}
              {...(!dropdown && { size: 23.5 })}
            />
          }
        >
          {t('mark_sent')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      parseInt(invoice.status_id) < parseInt(InvoiceStatus.Paid) &&
      !invoice.is_deleted &&
      showActionByPreferences('invoice', 'mark_paid') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('mark_paid'),
            key: 'mark_paid',
          })}
          onClick={() => bulk([invoice.id], 'mark_paid')}
          icon={<Icon element={MdPaid} {...(!dropdown && { size: 23.5 })} />}
        >
          {t('mark_paid')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      isInvoiceAutoBillable(invoice) &&
      showActionByPreferences('invoice', 'auto_bill') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('auto_bill'),
            key: 'auto_bill',
          })}
          onClick={() => bulk([invoice.id], 'auto_bill')}
          icon={<Icon element={BiMoney} {...(!dropdown && { size: 23.5 })} />}
        >
          {t('auto_bill')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      parseInt(invoice.status_id) < 4 &&
      showActionByPreferences('invoice', 'enter_payment') &&
      hasPermission('create_payment') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('enter_payment'),
            key: 'enter_payment',
          })}
          to={route('/payments/create?invoice=:invoiceId&client=:clientId', {
            invoiceId: invoice.id,
            clientId: invoice.client_id,
          })}
          icon={
            <Icon element={BiPlusCircle} {...(!dropdown && { size: 23.5 })} />
          }
        >
          {t('enter_payment')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'client_portal') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('client_portal'),
            key: 'client_portal',
          })}
          onClick={() => invoice && openClientPortal(invoice)}
          icon={
            <Icon element={MdCloudCircle} {...(!dropdown && { size: 23.5 })} />
          }
        >
          {t('client_portal')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      (invoice.status_id === InvoiceStatus.Sent ||
        invoice.status_id === InvoiceStatus.Partial) &&
      showActionByPreferences('invoice', 'cancel_invoice') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('cancel_invoice'),
            key: 'cancel_invoice',
          })}
          onClick={() => bulk([invoice.id], 'cancel')}
          icon={<Icon element={MdCancel} {...(!dropdown && { size: 23.5 })} />}
        >
          {t('cancel_invoice')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      (invoice.status_id === InvoiceStatus.Paid ||
        invoice.status_id === InvoiceStatus.Partial) &&
      !invoice.is_deleted &&
      !invoice.archived_at &&
      showActionByPreferences('invoice', 'reverse') &&
      hasPermission('create_credit') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('reverse'),
            key: 'reverse',
          })}
          onClick={() => reverseInvoice(invoice)}
          icon={<Icon element={MdRefresh} {...(!dropdown && { size: 23.5 })} />}
        >
          {t('reverse')}
        </DropdownElement>
      ),
    () => dropdown && <Divider withoutPadding />,
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'clone') &&
      hasPermission('create_invoice') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('clone'),
            key: 'clone',
          })}
          onClick={() => cloneToInvoice(invoice)}
          icon={
            <Icon
              element={MdControlPointDuplicate}
              {...(!dropdown && { size: 23.5 })}
            />
          }
        >
          {t('clone')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'clone_to_quote') &&
      hasPermission('create_quote') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('clone_to_quote'),
            key: 'clone_to_quote',
          })}
          onClick={() => cloneToQuote(invoice)}
          icon={
            <Icon
              element={MdControlPointDuplicate}
              {...(!dropdown && { size: 23.5 })}
            />
          }
        >
          {t('clone_to_quote')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'clone_to_credit') &&
      hasPermission('create_credit') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('clone_to_credit'),
            key: 'clone_to_credit',
          })}
          onClick={() => cloneToCredit(invoice)}
          icon={
            <Icon
              element={MdControlPointDuplicate}
              {...(!dropdown && { size: 23.5 })}
            />
          }
        >
          {t('clone_to_credit')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'clone_to_recurring') &&
      hasPermission('create_recurring_invoice') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('clone_to_recurring'),
            key: 'clone_to_recurring',
          })}
          onClick={() => cloneToRecurringInvoice(invoice)}
          icon={
            <Icon
              element={MdControlPointDuplicate}
              {...(!dropdown && { size: 23.5 })}
            />
          }
        >
          {t('clone_to_recurring')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'clone_to_purchase_order') &&
      hasPermission('create_purchase_order') && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('clone_to_purchase_order'),
            key: 'clone_to_purchase_order',
          })}
          onClick={() => cloneToPurchaseOrder(invoice)}
          icon={
            <Icon
              element={MdControlPointDuplicate}
              {...(!dropdown && { size: 23.5 })}
            />
          }
        >
          {t('clone_to_purchase_order')}
        </DropdownElement>
      ),
    () =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      dropdown && <Divider withoutPadding />,
    (invoice: Invoice) =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      invoice.archived_at === 0 &&
      (showActionByPreferences('invoice', 'archive') || dropdown) && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('archive'),
            key: 'archive',
          })}
          onClick={() => bulk([invoice.id], 'archive')}
          icon={<Icon element={MdArchive} {...(!dropdown && { size: 23.5 })} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      invoice.archived_at > 0 &&
      invoice.status_id !== InvoiceStatus.Cancelled &&
      (showActionByPreferences('invoice', 'restore') || dropdown) && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('restore'),
            key: 'restore',
          })}
          onClick={() => bulk([invoice.id], 'restore')}
          icon={<Icon element={MdRestore} {...(!dropdown && { size: 23.5 })} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      !invoice.is_deleted &&
      (showActionByPreferences('invoice', 'delete') || dropdown) && (
        <DropdownElement
          {...(!dropdown && {
            behavior: 'tooltipButton',
            tooltipText: t('delete'),
            key: 'delete',
          })}
          onClick={() => bulk([invoice.id], 'delete')}
          icon={<Icon element={MdDelete} {...(!dropdown && { size: 23.5 })} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];
}
