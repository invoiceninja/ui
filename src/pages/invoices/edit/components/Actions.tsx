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
import { atom, useAtom } from 'jotai';
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
  MdDesignServices,
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

export const isInvoiceAutoBillable = (invoice: Invoice) => {
  return (
    invoice.balance > 0 &&
    (invoice.status_id === InvoiceStatus.Sent ||
      invoice.status_id === InvoiceStatus.Partial) &&
    Boolean(invoice.client?.gateway_tokens.length)
  );
};

export const isChangeTemplateVisibleAtom = atom(false);
export const changeTemplateInvoicesAtom = atom<Invoice[]>([]);

interface Params {
  showEditAction?: boolean;
  showCommonBulkAction?: boolean;
  dropdown?: boolean;
}
export function useActions(params?: Params) {
  const { t } = useTranslation();

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

  const [, setChangeTemplateVisible] = useAtom(isChangeTemplateVisibleAtom);
  const [, setChangeTemplateInvoices] = useAtom(changeTemplateInvoicesAtom);

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
        <EmailInvoiceAction invoice={invoice} dropdown={dropdown} />
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'view_pdf') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          to={route('/invoices/:id/pdf', { id: invoice.id })}
          icon={
            <Icon
              element={MdPictureAsPdf}
              {...(!dropdown && { color: 'white' })}
            />
          }
        >
          {t('view_pdf')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      getEntityState(invoice) !== EntityState.Deleted &&
      showActionByPreferences('invoice', 'print_pdf') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => printPdf([invoice.id])}
          icon={
            <Icon element={MdPrint} {...(!dropdown && { color: 'white' })} />
          }
        >
          {t('print_pdf')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      invoice.status_id !== InvoiceStatus.Paid &&
      showActionByPreferences('invoice', 'schedule') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => scheduleEmailRecord(invoice.id)}
          icon={
            <Icon element={MdSchedule} {...(!dropdown && { color: 'white' })} />
          }
        >
          {t('schedule')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'delivery_note') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          to={route('/invoices/:id/pdf?delivery_note=true', { id: invoice.id })}
          icon={
            <Icon
              element={MdPictureAsPdf}
              {...(!dropdown && { color: 'white' })}
            />
          }
        >
          {t('delivery_note')} ({t('pdf')})
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'download') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => downloadPdf(invoice)}
          icon={
            <Icon element={MdDownload} {...(!dropdown && { color: 'white' })} />
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
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => bulk([invoice.id], 'mark_sent')}
          icon={
            <Icon
              element={MdMarkEmailRead}
              {...(!dropdown && { color: 'white' })}
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
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => bulk([invoice.id], 'mark_paid')}
          icon={
            <Icon element={MdPaid} {...(!dropdown && { color: 'white' })} />
          }
        >
          {t('mark_paid')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      isInvoiceAutoBillable(invoice) &&
      showActionByPreferences('invoice', 'auto_bill') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => bulk([invoice.id], 'auto_bill')}
          icon={
            <Icon element={BiMoney} {...(!dropdown && { color: 'white' })} />
          }
        >
          {t('auto_bill')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      parseInt(invoice.status_id) < 4 &&
      showActionByPreferences('invoice', 'enter_payment') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          to={route('/payments/create?invoice=:invoiceId&client=:clientId', {
            invoiceId: invoice.id,
            clientId: invoice.client_id,
          })}
          icon={
            <Icon
              element={BiPlusCircle}
              {...(!dropdown && { color: 'white' })}
            />
          }
        >
          {t('enter_payment')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'client_portal') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => invoice && openClientPortal(invoice)}
          icon={
            <Icon
              element={MdCloudCircle}
              {...(!dropdown && { color: 'white' })}
            />
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
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => bulk([invoice.id], 'cancel')}
          icon={
            <Icon element={MdCancel} {...(!dropdown && { color: 'white' })} />
          }
        >
          {t('cancel_invoice')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      (invoice.status_id === InvoiceStatus.Paid ||
        invoice.status_id === InvoiceStatus.Partial) &&
      !invoice.is_deleted &&
      !invoice.archived_at &&
      showActionByPreferences('invoice', 'reverse') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => reverseInvoice(invoice)}
          icon={
            <Icon element={MdRefresh} {...(!dropdown && { color: 'white' })} />
          }
        >
          {t('reverse')}
        </DropdownElement>
      ),
    () => dropdown && <Divider withoutPadding />,
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'clone') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => cloneToInvoice(invoice)}
          icon={
            <Icon
              element={MdControlPointDuplicate}
              {...(!dropdown && { color: 'white' })}
            />
          }
        >
          {t('clone')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'clone_to_quote') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => cloneToQuote(invoice)}
          icon={
            <Icon
              element={MdControlPointDuplicate}
              {...(!dropdown && { color: 'white' })}
            />
          }
        >
          {t('clone_to_quote')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'clone_to_credit') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => cloneToCredit(invoice)}
          icon={
            <Icon
              element={MdControlPointDuplicate}
              {...(!dropdown && { color: 'white' })}
            />
          }
        >
          {t('clone_to_credit')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'clone_to_recurring') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => cloneToRecurringInvoice(invoice)}
          icon={
            <Icon
              element={MdControlPointDuplicate}
              {...(!dropdown && { color: 'white' })}
            />
          }
        >
          {t('clone_to_recurring')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      showActionByPreferences('invoice', 'clone_to_purchase_order') && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => cloneToPurchaseOrder(invoice)}
          icon={
            <Icon
              element={MdControlPointDuplicate}
              {...(!dropdown && { color: 'white' })}
            />
          }
        >
          {t('clone_to_purchase_order')}
        </DropdownElement>
      ),
    (invoice: Invoice) => (
      <DropdownElement
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateInvoices([invoice]);
        }}
        icon={<Icon element={MdDesignServices} />}
      >
        {t('run_template')}
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
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => bulk([invoice.id], 'archive')}
          icon={
            <Icon element={MdArchive} {...(!dropdown && { color: 'white' })} />
          }
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
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => bulk([invoice.id], 'restore')}
          icon={
            <Icon element={MdRestore} {...(!dropdown && { color: 'white' })} />
          }
        >
          {t('restore')}
        </DropdownElement>
      ),
    (invoice: Invoice) =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      !invoice.is_deleted &&
      (showActionByPreferences('invoice', 'delete') || dropdown) && (
        <DropdownElement
          {...(!dropdown && { behavior: 'button' })}
          onClick={() => bulk([invoice.id], 'delete')}
          icon={
            <Icon element={MdDelete} {...(!dropdown && { color: 'white' })} />
          }
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];
}
