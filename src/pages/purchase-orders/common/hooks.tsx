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
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { EntityStatus } from '$app/components/EntityStatus';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useAtom, useSetAtom } from 'jotai';
import { useDownloadPdf } from '$app/pages/invoices/common/hooks/useDownloadPdf';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdCloudCircle,
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
          setErrors(error.response.data);
          toast.dismiss();
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
  const reactSettings = useReactSettings();
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
          <Link
            to={route('/purchase_orders/:id/edit', {
              id: purchaseOrder.id,
            })}
          >
            {field}
          </Link>
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
          formatMoney(
            value,
            purchaseOrder.vendor?.country_id,
            purchaseOrder.vendor?.currency_id
          ),
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

  const filters: SelectOption[] = [
    {
      label: t('all'),
      value: 'all',
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
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
      backgroundColor: '#93C5FD',
    },
    {
      label: t('accepted'),
      value: 'accepted',
      color: 'white',
      backgroundColor: '#1D4ED8',
    },
    {
      label: t('cancelled'),
      value: 'cancelled',
      color: 'white',
      backgroundColor: '#e6b05c',
    },
  ];

  return filters;
}

export function useActions() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const bulk = useBulk();
  const markSent = useMarkSent();
  const hasPermission = useHasPermission();

  const disableNavigation = useDisableNavigation();

  const { isAdmin, isOwner } = useAdmin();

  const downloadPdf = useDownloadPdf({ resource: 'purchase_order' });

  const scheduleEmailRecord = useScheduleEmailRecord({
    entity: 'purchase_order',
  });
  const printPdf = usePrintPdf({ entity: 'purchase_order' });

  const { isEditPage } = useEntityPageIdentifier({
    entity: 'purchase_order',
  });
  const downloadEPurchaseOrder = useDownloadEInvoice({
    resource: 'purchase_order',
    downloadType: 'download_e_purchase_order',
  });

  const [, setPurchaseOrder] = useAtom(purchaseOrderAtom);

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

  const { setChangeTemplateResources, setChangeTemplateVisible } =
    useChangeTemplate();

  const actions: Action<PurchaseOrder>[] = [
    (purchaseOrder) => (
      <DropdownElement
        onClick={() =>
          navigate(
            route('/purchase_orders/:id/email', { id: purchaseOrder.id })
          )
        }
        icon={<Icon element={MdSend} />}
      >
        {t('send_email')}
      </DropdownElement>
    ),
    (purchaseOrder) => (
      <DropdownElement
        onClick={() =>
          navigate(route('/purchase_orders/:id/pdf', { id: purchaseOrder.id }))
        }
        icon={<Icon element={MdPictureAsPdf} />}
      >
        {t('view_pdf')}
      </DropdownElement>
    ),
    (purchaseOrder) =>
      getEntityState(purchaseOrder) !== EntityState.Deleted && (
        <DropdownElement
          onClick={() => printPdf([purchaseOrder.id])}
          icon={<Icon element={MdPrint} />}
        >
          {t('print_pdf')}
        </DropdownElement>
      ),
    (purchaseOrder) =>
      purchaseOrder.status_id !== PurchaseOrderStatus.Accepted &&
      (isAdmin || isOwner) && (
        <DropdownElement
          onClick={() => scheduleEmailRecord(purchaseOrder.id)}
          icon={<Icon element={MdSchedule} />}
        >
          {t('schedule')}
        </DropdownElement>
      ),
    (purchaseOrder) => (
      <DropdownElement
        onClick={() => downloadPdf(purchaseOrder)}
        icon={<Icon element={MdDownload} />}
      >
        {t('download')}
      </DropdownElement>
    ),
    (purchaseOrder) => (
      <DropdownElement
        onClick={() => downloadEPurchaseOrder(purchaseOrder)}
        icon={<Icon element={MdDownload} />}
      >
        {t('download_e_purchase_order')}
      </DropdownElement>
    ),
    (purchaseOrder) =>
      purchaseOrder.status_id !== PurchaseOrderStatus.Accepted && (
        <DropdownElement
          onClick={() => markSent(purchaseOrder)}
          icon={<Icon element={MdMarkEmailRead} />}
        >
          {t('mark_sent')}
        </DropdownElement>
      ),
    (purchaseOrder) =>
      Boolean(!purchaseOrder.expense_id.length) && (
        <DropdownElement
          onClick={() => bulk([purchaseOrder.id], 'expense')}
          icon={<Icon element={MdSwitchRight} />}
        >
          {t('convert_to_expense')}
        </DropdownElement>
      ),
    (purchaseOrder) =>
      purchaseOrder.status_id === PurchaseOrderStatus.Accepted && (
        <DropdownElement
          onClick={() => bulk([purchaseOrder.id], 'add_to_inventory')}
          icon={<Icon element={MdInventory} />}
        >
          {t('add_to_inventory')}
        </DropdownElement>
      ),
    (purchaseOrder) =>
      Boolean(purchaseOrder.expense_id.length) &&
      !disableNavigation('expense', purchaseOrder.expense) && (
        <DropdownElement
          onClick={() =>
            navigate(
              route('/expenses/:id/edit', { id: purchaseOrder.expense_id })
            )
          }
          icon={<Icon element={MdPageview} />}
        >
          {`${t('view')} ${t('expense')}`}
        </DropdownElement>
      ),
    (purchaseOrder) => (
      <DropdownElement
        onClick={() => openClientPortal(purchaseOrder)}
        icon={<Icon element={MdCloudCircle} />}
      >
        {t('vendor_portal')}
      </DropdownElement>
    ),
    () => <Divider withoutPadding />,
    (purchaseOrder) =>
      hasPermission('create_purchase_order') && (
        <DropdownElement
          onClick={() => cloneToPurchaseOrder(purchaseOrder)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone_to_purchase_order')}
        </DropdownElement>
      ),
    (purchaseOrder) => <CloneOptionsModal purchaseOrder={purchaseOrder} />,
    (purchaseOrder) => (
      <DropdownElement
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources([purchaseOrder]);
        }}
        icon={<Icon element={MdDesignServices} />}
      >
        {t('run_template')}
      </DropdownElement>
    ),
    () => isEditPage && <Divider withoutPadding />,
    (purchaseOrder) =>
      Boolean(!purchaseOrder.archived_at) &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk([purchaseOrder.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (purchaseOrder) =>
      Boolean(purchaseOrder.archived_at) &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk([purchaseOrder.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (purchaseOrder) =>
      !purchaseOrder.is_deleted &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk([purchaseOrder.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}
