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
import { Invoice } from '$app/common/interfaces/invoice';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useSetAtom } from 'jotai';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { openClientPortal } from '$app/pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from '$app/pages/invoices/common/hooks/useDownloadPdf';
import { useTranslation } from 'react-i18next';
import { BiMoney, BiPlusCircle } from 'react-icons/bi';
import {
  MdArchive,
  MdCancel,
  MdCloudCircle,
  MdComment,
  MdCreditScore,
  MdDelete,
  MdDesignServices,
  MdDownload,
  MdEdit,
  MdMarkEmailRead,
  MdPaid,
  MdPictureAsPdf,
  MdPrint,
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
import { useCancelInvoiceModal } from '../hooks/useCancelInvoiceModal';
import { CancelInvoiceModal } from './CancelInvoiceModal';
import { useRectifyInvoiceModal } from '../hooks/useRectifyInvoiceModal';
import { RectifyInvoiceModal } from './RectifyInvoiceModal';
// import { useReverseInvoice } from '../../common/hooks/useReverseInvoice';
import { EmailInvoiceAction } from '../../common/components/EmailInvoiceAction';
import {
  useAdmin,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';
import { useDownloadEInvoice } from '$app/pages/invoices/common/hooks/useDownloadEInvoice';
import { CloneOptionsModal } from '../../common/components/CloneOptionsModal';
import { EntityActionElement } from '$app/components/EntityActionElement';
import { useChangeTemplate } from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { AddActivityComment } from '$app/pages/dashboard/hooks/useGenerateActivityElement';
import { useCompanyVerifactu } from '$app/common/hooks/useCompanyVerifactu';
import { useMarkPaid } from '../hooks/useMarkPaid';

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
  invoice?: Invoice | undefined;
}

export function useActions(params?: Params) {
  const { t } = useTranslation();

  const {
    showEditAction,
    showCommonBulkAction,
    dropdown = true,
    invoice: currentInvoice,
  } = params || {};

  const company = useCurrentCompany();
  const { isAdmin, isOwner } = useAdmin();
  const verifactuEnabled = useCompanyVerifactu();

  const { isEditPage } = useEntityPageIdentifier({
    entity: 'invoice',
    editPageTabs: [
      'documents',
      'settings',
      'activity',
      'history',
      'email_history',
    ],
  });

  const bulk = useBulk();
  const markPaid = useMarkPaid();
  const navigate = useNavigate();
  const {
    openModal: openCancelModal,
    isCancelModalOpen,
    closeModal: closeCancelModal,
    confirmCancel,
  } = useCancelInvoiceModal();
  const {
    openModal: openRectifyModal,
    isRectifyModalOpen,
    closeModal: closeRectifyModal,
    confirmRectify,
  } = useRectifyInvoiceModal();
  const hasPermission = useHasPermission();
  // const reverseInvoice = useReverseInvoice();
  const downloadPdf = useDownloadPdf({ resource: 'invoice' });
  const downloadEInvoice = useDownloadEInvoice({ resource: 'invoice' });
  const printPdf = usePrintPdf({ entity: 'invoice' });
  const scheduleEmailRecord = useScheduleEmailRecord({ entity: 'invoice' });
  const {
    setChangeTemplateVisible,
    setChangeTemplateResources,
    setChangeTemplateEntityContext,
  } = useChangeTemplate();

  const setInvoice = useSetAtom(invoiceAtom);

  const cloneToNegativeInvoice = (invoice: Invoice) => {
    // Create a deep copy of the invoice with negative quantities for all line items
    const negativeInvoice = {
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
      partial: 0,
      partial_due_date: '',
      // Reverse monetary amounts for credit note
      amount: -Math.abs(invoice.amount),
      balance: -Math.abs(invoice.balance),
      // Iterate through all line items and set quantities to negative
      line_items: invoice.line_items.map((item) => ({
        ...item,
        quantity: -Math.abs(item.quantity),
        // Recalculate line totals for negative quantities
        line_total: -Math.abs(item.line_total),
        gross_line_total: -Math.abs(item.gross_line_total),
      })),
      modified_invoice_id: invoice.id,
    };

    setInvoice(negativeInvoice);
    navigate('/invoices/create?action=clone');
  };

  const actions = [
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
    (invoice: Invoice) => (
      <EmailInvoiceAction
        {...(!dropdown && {
          key: 'email_invoice',
        })}
        invoice={invoice}
        isDropdown={dropdown}
      />
    ),
    (invoice: Invoice) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'view_pdf',
        })}
        entity="invoice"
        actionKey="view_pdf"
        isCommonActionSection={!dropdown}
        tooltipText={t('view_pdf')}
        to={route('/invoices/:id/pdf', { id: invoice.id })}
        icon={MdPictureAsPdf}
      >
        {t('view_pdf')}
      </EntityActionElement>
    ),
    (invoice: Invoice) =>
      getEntityState(invoice) !== EntityState.Deleted && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'print_pdf',
          })}
          entity="invoice"
          actionKey="print_pdf"
          isCommonActionSection={!dropdown}
          tooltipText={t('print_pdf')}
          onClick={() => printPdf([invoice.id])}
          icon={MdPrint}
          disablePreventNavigation
        >
          {t('print_pdf')}
        </EntityActionElement>
      ),

    (invoice: Invoice) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'delivery_note',
        })}
        entity="invoice"
        actionKey="delivery_note"
        isCommonActionSection={!dropdown}
        tooltipText={`${t('delivery_note')} ${t('pdf')}`}
        to={route('/invoices/:id/pdf?delivery_note=true', { id: invoice.id })}
        icon={MdPictureAsPdf}
      >
        {t('delivery_note')} ({t('pdf')})
      </EntityActionElement>
    ),
    (invoice: Invoice) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'download',
        })}
        entity="invoice"
        actionKey="download"
        isCommonActionSection={!dropdown}
        tooltipText={t('download')}
        onClick={() => downloadPdf(invoice)}
        icon={MdDownload}
        disablePreventNavigation
      >
        {t('download')}
      </EntityActionElement>
    ),
    (invoice: Invoice) =>
      Boolean(company?.settings.enable_e_invoice) && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'download_e_invoice',
          })}
          entity="invoice"
          actionKey="download_e_invoice"
          isCommonActionSection={!dropdown}
          tooltipText={t('download_e_invoice')}
          onClick={() => downloadEInvoice(invoice)}
          icon={MdDownload}
          disablePreventNavigation
        >
          {t('download_e_invoice')}
        </EntityActionElement>
      ),
    (invoice: Invoice) => (
      <AddActivityComment
        {...(!dropdown && {
          key: 'add_comment',
        })}
        entity="invoice"
        entityId={invoice.id}
        label={invoice.number}
        labelElement={
          <EntityActionElement
            entity="invoice"
            actionKey="add_comment"
            isCommonActionSection={!dropdown}
            tooltipText={t('add_comment')}
            icon={MdComment}
            disablePreventNavigation
          >
            {t('add_comment')}
          </EntityActionElement>
        }
      />
    ),
    (invoice: Invoice) =>
      invoice.status_id === InvoiceStatus.Draft &&
      !invoice.is_deleted && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'mark_sent',
          })}
          entity="invoice"
          actionKey="mark_sent"
          isCommonActionSection={!dropdown}
          tooltipText={t('mark_sent')}
          onClick={() => bulk([invoice.id], 'mark_sent')}
          icon={MdMarkEmailRead}
          disablePreventNavigation
        >
          {t('mark_sent')}
        </EntityActionElement>
      ),
    (invoice: Invoice) =>
      parseInt(invoice.status_id) < parseInt(InvoiceStatus.Paid) &&
      !invoice.is_deleted && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'mark_paid',
          })}
          entity="invoice"
          actionKey="mark_paid"
          isCommonActionSection={!dropdown}
          tooltipText={t('mark_paid')}
          onClick={() =>
            currentInvoice ? markPaid(currentInvoice) : markPaid(invoice)
          }
          icon={MdPaid}
          disablePreventNavigation
        >
          {t('mark_paid')}
        </EntityActionElement>
      ),
    (invoice: Invoice) =>
      isInvoiceAutoBillable(invoice) && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'auto_bill',
          })}
          entity="invoice"
          actionKey="auto_bill"
          isCommonActionSection={!dropdown}
          tooltipText={t('auto_bill')}
          onClick={() => bulk([invoice.id], 'auto_bill')}
          icon={BiMoney}
          disablePreventNavigation
        >
          {t('auto_bill')}
        </EntityActionElement>
      ),
    (invoice: Invoice) =>
      parseInt(invoice.status_id) < 4 &&
      hasPermission('create_payment') && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'enter_payment',
          })}
          entity="invoice"
          actionKey="enter_payment"
          isCommonActionSection={!dropdown}
          tooltipText={t('enter_payment')}
          to={route('/payments/create?invoice=:invoiceId&client=:clientId', {
            invoiceId: invoice.id,
            clientId: invoice.client_id,
          })}
          icon={BiPlusCircle}
        >
          {t('enter_payment')}
        </EntityActionElement>
      ),
    (invoice: Invoice) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'client_portal',
        })}
        entity="invoice"
        actionKey="client_portal"
        isCommonActionSection={!dropdown}
        tooltipText={t('client_portal')}
        onClick={() => invoice && openClientPortal(invoice)}
        icon={MdCloudCircle}
        disablePreventNavigation
      >
        {t('client_portal')}
      </EntityActionElement>
    ),

    // (invoice: Invoice) =>
    //   (invoice.status_id === InvoiceStatus.Paid ||
    //     invoice.status_id === InvoiceStatus.Partial) &&
    //   !invoice.is_deleted &&
    //   !invoice.archived_at &&
    //   hasPermission('create_credit') && (
    //     <EntityActionElement
    //       {...(!dropdown && {
    //         key: 'reverse',
    //       })}
    //       entity="invoice"
    //       actionKey="reverse"
    //       isCommonActionSection={!dropdown}
    //       tooltipText={t('reverse')}
    //       onClick={() => reverseInvoice(invoice)}
    //       icon={MdRefresh}
    //     >
    //       {t('reverse')}
    //     </EntityActionElement>
    //   ),
    (invoice: Invoice) =>
      !invoice.is_deleted &&
      ['1', '2', '3'].includes(invoice.status_id) &&
      !['R1', 'R2'].includes(invoice.backup?.document_type ?? '') &&
      (isAdmin || isOwner) && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'schedule',
          })}
          entity="invoice"
          actionKey="schedule"
          isCommonActionSection={!dropdown}
          tooltipText={t('schedule')}
          onClick={() => scheduleEmailRecord(invoice.id)}
          icon={MdSchedule}
        >
          {t('schedule')}
        </EntityActionElement>
      ),
    (invoice: Invoice) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'run_template',
        })}
        entity="invoice"
        actionKey="run_template"
        isCommonActionSection={!dropdown}
        tooltipText={t('run_template')}
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources([invoice]);
          setChangeTemplateEntityContext({
            endpoint: '/api/v1/invoices/bulk',
            entity: 'invoice',
          });
        }}
        icon={MdDesignServices}
      >
        {t('run_template')}
      </EntityActionElement>
    ),
    () => dropdown && <Divider withoutPadding />,
    (invoice: Invoice) => (
      <CloneOptionsModal
        {...(!dropdown && {
          key: 'clone_to',
        })}
        dropdown={dropdown}
        invoice={invoice}
      />
    ),
    () =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      dropdown && <Divider withoutPadding />,
    (invoice: Invoice) =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      invoice.archived_at === 0 && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'archive',
          })}
          entity="invoice"
          actionKey="archive"
          isCommonActionSection={!dropdown}
          tooltipText={t('archive')}
          onClick={() => bulk([invoice.id], 'archive')}
          icon={MdArchive}
          excludePreferences
          disablePreventNavigation
        >
          {t('archive')}
        </EntityActionElement>
      ),
    (invoice: Invoice) =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      invoice.archived_at > 0 &&
      invoice.status_id !== InvoiceStatus.Cancelled && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'restore',
          })}
          entity="invoice"
          actionKey="restore"
          isCommonActionSection={!dropdown}
          tooltipText={t('restore')}
          onClick={() => bulk([invoice.id], 'restore')}
          icon={MdRestore}
          excludePreferences
          disablePreventNavigation
        >
          {t('restore')}
        </EntityActionElement>
      ),
    (invoice: Invoice) =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      !invoice.is_deleted &&
      (!verifactuEnabled ||
        (verifactuEnabled && invoice.status_id === InvoiceStatus.Draft)) && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'delete',
          })}
          entity="invoice"
          actionKey="delete"
          isCommonActionSection={!dropdown}
          tooltipText={t('delete')}
          onClick={() => bulk([invoice.id], 'delete')}
          icon={MdDelete}
          excludePreferences
          disablePreventNavigation
        >
          {t('delete')}
        </EntityActionElement>
      ),
    (invoice: Invoice) =>
      (invoice.status_id === InvoiceStatus.Sent ||
        invoice.status_id === InvoiceStatus.Partial) &&
      !['R1', 'R2'].includes(invoice.backup?.document_type ?? '') &&
      (invoice.backup?.child_invoice_ids?.length ?? 0) === 0 && (
        <EntityActionElement
          key="cancel_invoice"
          entity="invoice"
          actionKey="cancel_invoice"
          isCommonActionSection={!dropdown}
          tooltipText={t('cancel_invoice')}
          onClick={() => {
            // If Verifactu is enabled, show modal to get cancellation reason
            // Otherwise, cancel directly without modal
            if (verifactuEnabled) {
              openCancelModal(invoice.id);
            } else {
              bulk([invoice.id], 'cancel');
            }
          }}
          icon={MdCancel}
          disablePreventNavigation
        >
          {t('cancel_invoice')}
        </EntityActionElement>
      ),
    (invoice: Invoice) =>
      invoice.status_id === InvoiceStatus.Sent &&
      invoice.client?.country_id === '724' &&
      invoice.backup?.document_type === 'F1' &&
      (invoice.backup?.adjustable_amount ?? 0) > 0 &&
      invoice.amount > 0 &&
      company?.settings.e_invoice_type === 'VERIFACTU' &&
      !invoice.is_deleted && (
        <EntityActionElement
          key="credit_note"
          entity="invoice"
          actionKey="credit_note"
          isCommonActionSection={!dropdown}
          tooltipText={t('credit_note')}
          onClick={() => openRectifyModal(invoice)}
          icon={MdCreditScore}
          disablePreventNavigation
        >
          {t('rectify')}
        </EntityActionElement>
      ),
  ];

  return {
    actions,
    modal: (
      <>
        {verifactuEnabled && (
          <CancelInvoiceModal
            visible={isCancelModalOpen}
            onClose={closeCancelModal}
            onConfirm={confirmCancel}
          />
        )}
        <RectifyInvoiceModal
          visible={isRectifyModalOpen}
          onClose={closeRectifyModal}
          onConfirm={confirmRectify}
        />
      </>
    ),
  };
}
