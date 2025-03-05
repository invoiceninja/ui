/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { AxiosError } from 'axios';
import { PurchaseOrderStatus } from '$app/common/enums/purchase-order-status';
import { date, endpoint, getEntityState } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { SelectOption } from '$app/components/datatables/Actions';
import { EntityStatus } from '$app/components/EntityStatus';
import { Action } from '$app/components/ResourceActions';
import { useAtom, useSetAtom } from 'jotai';
import { useDownloadPdf } from '$app/pages/invoices/common/hooks/useDownloadPdf';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdCloudCircle,
  MdComment,
  MdControlPointDuplicate,
  MdDelete,
  MdDesignServices,
  MdDownload,
  MdInventory,
  MdMarkEmailRead,
  MdPageview,
  MdPictureAsPdf,
  MdPrint,
  MdRestore,
  MdSchedule,
  MdSend,
  MdSwitchRight,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { purchaseOrderAtom } from './atoms';
import { openClientPortal } from '$app/pages/invoices/common/helpers/open-client-portal';
import { Divider } from '$app/components/cards/Divider';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { PurchaseOrderStatus as PurchaseOrderStatusBadge } from '$app/pages/purchase-orders/common/components/PurchaseOrderStatus';
import { useScheduleEmailRecord } from '$app/pages/invoices/common/hooks/useScheduleEmailRecord';
import { usePrintPdf } from '$app/pages/invoices/common/hooks/usePrintPdf';
import { EntityState } from '$app/common/enums/entity-state';
import { isDeleteActionTriggeredAtom } from '$app/pages/invoices/common/components/ProductsTable';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import dayjs from 'dayjs';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { useBulk, useMarkSent } from '$app/common/queries/purchase-orders';
import { $refetch } from '$app/common/hooks/useRefetch';
import { CloneOptionsModal } from './components/CloneOptionsModal';
import {
  useAdmin,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { useChangeTemplate } from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { useDownloadEInvoice } from '$app/pages/invoices/common/hooks/useDownloadEInvoice';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { DynamicLink } from '$app/components/DynamicLink';
import { CopyToClipboardIconOnly } from '$app/components/CopyToClipBoardIconOnly';
import { useStatusThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import { useFormatNumber } from '$app/common/hooks/useFormatNumber';
import { AddActivityComment } from '$app/pages/dashboard/hooks/useGenerateActivityElement';
import { EntityActionElement } from '$app/components/EntityActionElement';

interface CreateProps {
  isDefaultTerms: boolean;
  isDefaultFooter: boolean;
  setErrors: (validationBag?: ValidationBag) => unknown;
}

export function useCreate(props: CreateProps) {
  const { setErrors, isDefaultTerms, isDefaultFooter } = props;

  const navigate = useNavigate();

  const refreshCompanyUsers = useRefreshCompanyUsers();
  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  return (purchaseOrder: PurchaseOrder) => {
    toast.processing();
    setErrors(undefined);

    let apiEndpoint = '/api/v1/purchase_orders?';

    if (isDefaultTerms) {
      apiEndpoint += 'save_default_terms=true';
      if (isDefaultFooter) {
        apiEndpoint += '&save_default_footer=true';
      }
    } else if (isDefaultFooter) {
      apiEndpoint += 'save_default_footer=true';
    }

    request('POST', endpoint(apiEndpoint), purchaseOrder)
      .then(async (response: GenericSingleResourceResponse<PurchaseOrder>) => {
        if (isDefaultTerms || isDefaultFooter) {
          await refreshCompanyUsers();
        }

        toast.success('created_purchase_order');

        $refetch(['purchase_orders']);

        navigate(
          route('/purchase_orders/:id/edit', {
            id: response.data.data.id,
          })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          const errorMessages = error.response.data;

          if (errorMessages.errors.amount) {
            toast.error(errorMessages.errors.amount[0]);
          } else {
            toast.dismiss();
          }

          setErrors(errorMessages);
        }
      })
      .finally(() => setIsDeleteActionTriggered(undefined));
  };
}

export const defaultColumns: string[] = [
  'status',
  'number',
  'vendor',
  'expense',
  'amount',
  'date',
  'due_date',
];

export function useAllPurchaseOrderColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'invoice',
    });

  const purchaseOrderColumns = [
    'status',
    'number',
    'vendor',
    'expense',
    'amount',
    'date',
    'due_date',
    'archived_at',
    // 'assigned_to', @Todo: Need to resolve relationship
    // 'client', @Todo: Need to resolve relationship (client+po?)
    'contact_email',
    'contact_name',
    'created_at',
    // 'created_by', @Todo: Need to resolve relationship
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
    'discount',
    'documents',
    'entity_state',
    'exchange_rate',
  ] as const;

  return purchaseOrderColumns;
}

export function usePurchaseOrderColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const formatNumber = useFormatNumber();
  const reactSettings = useReactSettings();
  const disableNavigation = useDisableNavigation();
  const formatCustomFieldValue = useFormatCustomFieldValue();

  const purchaseOrderColumns = useAllPurchaseOrderColumns();
  type PurchaseOrderColumns = (typeof purchaseOrderColumns)[number];

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'invoice',
    });

  const columns: DataTableColumnsExtended<PurchaseOrder, PurchaseOrderColumns> =
    [
      {
        column: 'status',
        id: 'status_id',
        label: t('status'),
        format: (field, purchaseOrder) => (
          <Link
            to={route('/purchase_orders/:id/edit', {
              id: purchaseOrder.id,
            })}
          >
            <PurchaseOrderStatusBadge entity={purchaseOrder} />
          </Link>
        ),
      },
      {
        column: 'number',
        id: 'number',
        label: t('number'),
        format: (field, purchaseOrder) => (
          <div className="flex space-x-2">
            <DynamicLink
              to={route('/purchase_orders/:id/edit', { id: purchaseOrder.id })}
              renderSpan={disableNavigation('purchase_order', purchaseOrder)}
            >
              {field}
            </DynamicLink>

            <CopyToClipboardIconOnly text={purchaseOrder.number} />
          </div>
        ),
      },
      {
        column: 'vendor',
        id: 'vendor_id',
        label: t('vendor'),
        format: (field, purchaseOrder) =>
          purchaseOrder.vendor && (
            <Link to={route('/vendors/:id', { id: purchaseOrder.vendor.id })}>
              {purchaseOrder.vendor.name}
            </Link>
          ),
      },
      {
        column: 'expense',
        id: 'expense_id',
        label: t('expense'),
        format: (field, purchaseOrder) =>
          purchaseOrder.expense && (
            <Link
              to={route('/expenses/:id/edit', { id: purchaseOrder.expense.id })}
            >
              {purchaseOrder.expense.number}
            </Link>
          ),
      },
      {
        column: 'amount',
        id: 'amount',
        label: t('amount'),
        format: (amount, po) =>
          formatMoney(amount, po.vendor?.country_id, po.vendor?.currency_id),
      },
      {
        column: 'date',
        id: 'date',
        label: t('date'),
        format: (value) => date(value, dateFormat),
      },
      {
        column: 'due_date',
        id: 'due_date',
        label: t('due_date'),
        format: (value) => date(value, dateFormat),
      },
      {
        column: 'archived_at',
        id: 'archived_at',
        label: t('archived_at'),
        format: (value) => date(value, dateFormat),
      },
      {
        column: 'contact_name',
        id: 'id',
        label: t('contact_name'),
        format: (value, purchaseOrder) =>
          purchaseOrder.vendor &&
          purchaseOrder.vendor?.contacts?.length > 0 && (
            <Link to={route('/vendors/:id', { id: purchaseOrder.id })}>
              {purchaseOrder.vendor.contacts[0].first_name}{' '}
              {purchaseOrder.vendor.contacts[0].last_name}
            </Link>
          ),
      },
      {
        column: 'contact_email',
        id: 'id',
        label: t('contact_name'),
        format: (value, purchaseOrder) =>
          purchaseOrder.vendor && (
            <CopyToClipboard text={purchaseOrder.vendor.contacts[0].email} />
          ),
      },
      {
        column: 'created_at',
        id: 'created_at',
        label: t('created_at'),
        format: (value) => date(value, dateFormat),
      },
      {
        column: firstCustom,
        id: 'custom_value1',
        label: firstCustom,
        format: (value) =>
          formatCustomFieldValue('invoice1', value?.toString()),
      },
      {
        column: secondCustom,
        id: 'custom_value2',
        label: secondCustom,
        format: (value) =>
          formatCustomFieldValue('invoice2', value?.toString()),
      },
      {
        column: thirdCustom,
        id: 'custom_value3',
        label: thirdCustom,
        format: (value) =>
          formatCustomFieldValue('invoice3', value?.toString()),
      },
      {
        column: fourthCustom,
        id: 'custom_value4',
        label: fourthCustom,
        format: (value) =>
          formatCustomFieldValue('invoice4', value?.toString()),
      },
      {
        column: 'discount',
        id: 'discount',
        label: t('discount'),
        format: (value, purchaseOrder) =>
          purchaseOrder.is_amount_discount
            ? formatMoney(
                value,
                purchaseOrder.vendor?.country_id,
                purchaseOrder.vendor?.currency_id
              )
            : `${formatNumber(value)} %`,
      },
      {
        column: 'documents',
        id: 'documents',
        label: t('documents'),
        format: (value, purchaseOrder) => purchaseOrder.documents.length,
      },
      {
        column: 'entity_state',
        id: 'id',
        label: t('entity_state'),
        format: (value, purchaseOrder) => (
          <EntityStatus entity={purchaseOrder} />
        ),
      },
      {
        column: 'exchange_rate',
        id: 'exchange_rate',
        label: t('exchange_rate'),
        format: (value) => formatNumber(value),
      },
    ];

  const list: string[] =
    reactSettings?.react_table_columns?.purchaseOrder || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function usePurchaseOrderFilters() {
  const [t] = useTranslation();

  const statusThemeColors = useStatusThemeColorScheme();

  const filters: SelectOption[] = [
    {
      label: t('draft'),
      value: 'draft',
      color: 'white',
      backgroundColor: '#6B7280',
    },
    {
      label: t('sent'),
      value: 'sent',
      color: 'white',
      backgroundColor: statusThemeColors.$1 || '#93C5FD',
    },
    {
      label: t('accepted'),
      value: 'accepted',
      color: 'white',
      backgroundColor: statusThemeColors.$2 || '#1D4ED8',
    },
    {
      label: t('cancelled'),
      value: 'cancelled',
      color: 'white',
      backgroundColor: statusThemeColors.$5 || '#e6b05c',
    },
  ];

  return filters;
}

interface ActionsParams {
  dropdown?: boolean;
}

export function useActions(params: ActionsParams = {}) {
  const { dropdown = true } = params;

  const [t] = useTranslation();

  const company = useCurrentCompany();
  const { isAdmin, isOwner } = useAdmin();
  const { isEditPage } = useEntityPageIdentifier({
    entity: 'purchase_order',
  });

  const [, setPurchaseOrder] = useAtom(purchaseOrderAtom);

  const bulk = useBulk();
  const navigate = useNavigate();
  const markSent = useMarkSent();
  const hasPermission = useHasPermission();
  const disableNavigation = useDisableNavigation();
  const printPdf = usePrintPdf({ entity: 'purchase_order' });
  const downloadPdf = useDownloadPdf({ resource: 'purchase_order' });
  const scheduleEmailRecord = useScheduleEmailRecord({
    entity: 'purchase_order',
  });
  const downloadEPurchaseOrder = useDownloadEInvoice({
    resource: 'purchase_order',
    downloadType: 'download_e_purchase_order',
  });
  const {
    setChangeTemplateResources,
    setChangeTemplateVisible,
    setChangeTemplateEntityContext,
  } = useChangeTemplate();

  const cloneToPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setPurchaseOrder({
      ...purchaseOrder,
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
      client_id: '',
      paid_to_date: 0,
      vendor: undefined,
    });

    navigate('/purchase_orders/create?action=clone');
  };

  const actions: Action<PurchaseOrder>[] = [
    (purchaseOrder) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'send_email',
        })}
        entity="purchase_order"
        actionKey="send_email"
        isCommonActionSection={!dropdown}
        tooltipText={t('send_email')}
        to={route('/purchase_orders/:id/email', { id: purchaseOrder.id })}
        icon={MdSend}
      >
        {t('send_email')}
      </EntityActionElement>
    ),
    (purchaseOrder) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'view_pdf',
        })}
        entity="purchase_order"
        actionKey="view_pdf"
        isCommonActionSection={!dropdown}
        tooltipText={t('view_pdf')}
        to={route('/purchase_orders/:id/pdf', { id: purchaseOrder.id })}
        icon={MdPictureAsPdf}
      >
        {t('view_pdf')}
      </EntityActionElement>
    ),
    (purchaseOrder) =>
      getEntityState(purchaseOrder) !== EntityState.Deleted && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'print_pdf',
          })}
          entity="purchase_order"
          actionKey="print_pdf"
          isCommonActionSection={!dropdown}
          tooltipText={t('print_pdf')}
          onClick={() => printPdf([purchaseOrder.id])}
          icon={MdPrint}
          disablePreventNavigation
        >
          {t('print_pdf')}
        </EntityActionElement>
      ),
    (purchaseOrder) =>
      purchaseOrder.status_id !== PurchaseOrderStatus.Accepted &&
      (isAdmin || isOwner) && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'schedule',
          })}
          entity="purchase_order"
          actionKey="schedule"
          isCommonActionSection={!dropdown}
          tooltipText={t('schedule')}
          onClick={() => scheduleEmailRecord(purchaseOrder.id)}
          icon={MdSchedule}
        >
          {t('schedule')}
        </EntityActionElement>
      ),
    (purchaseOrder) => (
      <AddActivityComment
        {...(!dropdown && {
          key: 'add_comment',
        })}
        entity="purchase_order"
        entityId={purchaseOrder.id}
        label={`#${purchaseOrder.number}`}
        labelElement={
          <EntityActionElement
            entity="purchase_order"
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
    (purchaseOrder) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'download',
        })}
        entity="purchase_order"
        actionKey="download"
        isCommonActionSection={!dropdown}
        tooltipText={t('download')}
        onClick={() => downloadPdf(purchaseOrder)}
        icon={MdDownload}
        disablePreventNavigation
      >
        {t('download')}
      </EntityActionElement>
    ),
    (purchaseOrder) =>
      Boolean(company?.settings.enable_e_invoice) && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'download_e_purchase_order',
          })}
          entity="purchase_order"
          actionKey="download_e_purchase_order"
          isCommonActionSection={!dropdown}
          tooltipText={t('download_e_purchase_order')}
          onClick={() => downloadEPurchaseOrder(purchaseOrder)}
          icon={MdDownload}
          disablePreventNavigation
        >
          {t('download_e_purchase_order')}
        </EntityActionElement>
      ),
    (purchaseOrder) =>
      purchaseOrder.status_id !== PurchaseOrderStatus.Accepted && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'mark_sent',
          })}
          entity="purchase_order"
          actionKey="mark_sent"
          isCommonActionSection={!dropdown}
          tooltipText={t('mark_sent')}
          onClick={() => markSent(purchaseOrder)}
          icon={MdMarkEmailRead}
          disablePreventNavigation
        >
          {t('mark_sent')}
        </EntityActionElement>
      ),
    (purchaseOrder) =>
      Boolean(!purchaseOrder.expense_id.length) && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'convert_to_expense',
          })}
          entity="purchase_order"
          actionKey="convert_to_expense"
          isCommonActionSection={!dropdown}
          tooltipText={t('convert_to_expense')}
          onClick={() => bulk([purchaseOrder.id], 'expense')}
          icon={MdSwitchRight}
          disablePreventNavigation
        >
          {t('convert_to_expense')}
        </EntityActionElement>
      ),
    (purchaseOrder) =>
      purchaseOrder.status_id === PurchaseOrderStatus.Accepted && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'add_to_inventory',
          })}
          entity="purchase_order"
          actionKey="add_to_inventory"
          isCommonActionSection={!dropdown}
          tooltipText={t('add_to_inventory')}
          onClick={() => bulk([purchaseOrder.id], 'add_to_inventory')}
          icon={MdInventory}
          disablePreventNavigation
        >
          {t('add_to_inventory')}
        </EntityActionElement>
      ),
    (purchaseOrder) =>
      Boolean(purchaseOrder.expense_id.length) &&
      !disableNavigation('expense', purchaseOrder.expense) && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'view_expense',
          })}
          entity="purchase_order"
          actionKey="view_expense"
          isCommonActionSection={!dropdown}
          tooltipText={`${t('view')} ${t('expense')}`}
          onClick={() =>
            navigate(
              route('/expenses/:id/edit', { id: purchaseOrder.expense_id })
            )
          }
          icon={MdPageview}
        >
          {`${t('view')} ${t('expense')}`}
        </EntityActionElement>
      ),
    (purchaseOrder) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'vendor_portal',
        })}
        entity="purchase_order"
        actionKey="vendor_portal"
        isCommonActionSection={!dropdown}
        tooltipText={t('vendor_portal')}
        onClick={() => openClientPortal(purchaseOrder)}
        icon={MdCloudCircle}
        disablePreventNavigation
      >
        {t('vendor_portal')}
      </EntityActionElement>
    ),
    () => <Divider withoutPadding />,
    (purchaseOrder) =>
      hasPermission('create_purchase_order') && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'clone_to_purchase_order',
          })}
          entity="purchase_order"
          actionKey="clone_to_purchase_order"
          isCommonActionSection={!dropdown}
          tooltipText={t('clone_to_purchase_order')}
          onClick={() => cloneToPurchaseOrder(purchaseOrder)}
          icon={MdControlPointDuplicate}
        >
          {t('clone_to_purchase_order')}
        </EntityActionElement>
      ),
    (purchaseOrder) => (
      <CloneOptionsModal
        {...(!dropdown && {
          key: 'clone_to_other',
        })}
        purchaseOrder={purchaseOrder}
        dropdown={dropdown}
      />
    ),
    (purchaseOrder) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'run_template',
        })}
        entity="purchase_order"
        actionKey="run_template"
        isCommonActionSection={!dropdown}
        tooltipText={t('run_template')}
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources([purchaseOrder]);
          setChangeTemplateEntityContext({
            endpoint: '/api/v1/purchase_orders/bulk',
            entity: 'purchase_order',
          });
        }}
        icon={MdDesignServices}
      >
        {t('run_template')}
      </EntityActionElement>
    ),
    () => isEditPage && <Divider withoutPadding />,
    (purchaseOrder) =>
      Boolean(!purchaseOrder.archived_at) &&
      isEditPage && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'archive',
          })}
          entity="purchase_order"
          actionKey="archive"
          isCommonActionSection={!dropdown}
          tooltipText={t('archive')}
          onClick={() => bulk([purchaseOrder.id], 'archive')}
          icon={MdArchive}
          excludePreferences
          disablePreventNavigation
        >
          {t('archive')}
        </EntityActionElement>
      ),
    (purchaseOrder) =>
      Boolean(purchaseOrder.archived_at) &&
      isEditPage && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'restore',
          })}
          entity="purchase_order"
          actionKey="restore"
          isCommonActionSection={!dropdown}
          tooltipText={t('restore')}
          onClick={() => bulk([purchaseOrder.id], 'restore')}
          icon={MdRestore}
          disablePreventNavigation
          excludePreferences
        >
          {t('restore')}
        </EntityActionElement>
      ),
    (purchaseOrder) =>
      !purchaseOrder.is_deleted &&
      isEditPage && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'delete',
          })}
          entity="purchase_order"
          actionKey="delete"
          isCommonActionSection={!dropdown}
          tooltipText={t('delete')}
          onClick={() => bulk([purchaseOrder.id], 'delete')}
          icon={MdDelete}
          disablePreventNavigation
          excludePreferences
        >
          {t('delete')}
        </EntityActionElement>
      ),
  ];

  return actions;
}
