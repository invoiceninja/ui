/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import purchaseOrderStatus from 'common/constants/purchase-order-status';
import { PurchaseOrderStatus } from 'common/enums/purchase-order-status';
import { date, endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { CopyToClipboard } from 'components/CopyToClipboard';
import { SelectOption } from 'components/datatables/Actions';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { EntityStatus } from 'components/EntityStatus';
import { Icon } from 'components/icons/Icon';
import { Action } from 'components/ResourceActions';
import { StatusBadge } from 'components/StatusBadge';
import { useAtom } from 'jotai';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { DataTableColumnsExtended } from 'pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdCloudCircle,
  MdControlPointDuplicate,
  MdDelete,
  MdDownload,
  MdMarkEmailRead,
  MdPageview,
  MdPictureAsPdf,
  MdRestore,
  MdSend,
  MdSwitchRight,
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { purchaseOrderAtom } from './atoms';
import { useBulk, useMarkSent } from './queries';
import { openClientPortal } from 'pages/invoices/common/helpers/open-client-portal';
import { Divider } from 'components/cards/Divider';
import { useEntityCustomFields } from 'common/hooks/useEntityCustomFields';

interface CreateProps {
  setErrors: (validationBag?: ValidationBag) => unknown;
}

export function useCreate(props: CreateProps) {
  const { setErrors } = props;

  const navigate = useNavigate();

  return (purchaseOrder: PurchaseOrder) => {
    toast.processing();
    setErrors(undefined);

    request('POST', endpoint('/api/v1/purchase_orders'), purchaseOrder)
      .then((response: GenericSingleResourceResponse<PurchaseOrder>) => {
        toast.success('created_purchase_order');

        navigate(
          route('/purchase_orders/:id/edit', {
            id: response.data.data.id,
          })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        console.error(error);

        error.response?.status === 422
          ? toast.dismiss() && setErrors(error.response.data)
          : toast.error();
      });
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

  const currentUser = useCurrentUser();
  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

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
            <StatusBadge for={purchaseOrderStatus} code={field} />
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
        format: (amount) =>
          formatMoney(
            amount,
            company?.settings.country_id,
            company?.settings.currency_id
          ),
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
      },
      {
        column: secondCustom,
        id: 'custom_value2',
        label: secondCustom,
      },
      {
        column: thirdCustom,
        id: 'custom_value3',
        label: thirdCustom,
      },
      {
        column: fourthCustom,
        id: 'custom_value4',
        label: fourthCustom,
      },
      {
        column: 'discount',
        id: 'discount',
        label: t('discount'),
        format: (value, purchaseOrder) =>
          formatMoney(
            value,
            purchaseOrder.vendor?.country_id || company?.settings.country_id,
            purchaseOrder.vendor?.currency_id || company?.settings.currency_id
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
    currentUser?.company_user?.settings?.react_table_columns?.purchaseOrder ||
    defaultColumns;

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

  const location = useLocation();

  const bulk = useBulk();

  const markSent = useMarkSent();

  const downloadPdf = useDownloadPdf({ resource: 'purchase_order' });

  const isEditPage = location.pathname.endsWith('/edit');

  const [, setPurchaseOrder] = useAtom(purchaseOrderAtom);

  const cloneToPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setPurchaseOrder({ ...purchaseOrder, number: '', documents: [] });

    navigate('/purchase_orders/create?action=clone');
  };

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
    (purchaseOrder) => (
      <DropdownElement
        onClick={() => downloadPdf(purchaseOrder)}
        icon={<Icon element={MdDownload} />}
      >
        {t('download')}
      </DropdownElement>
    ),
    (purchaseOrder) =>
      purchaseOrder.status_id !== PurchaseOrderStatus.Sent && (
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
          onClick={() => bulk(purchaseOrder.id, 'expense')}
          icon={<Icon element={MdSwitchRight} />}
        >
          {t('convert_to_expense')}
        </DropdownElement>
      ),
    (purchaseOrder) =>
      Boolean(purchaseOrder.expense_id.length) && (
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
    (purchaseOrder) => (
      <DropdownElement
        onClick={() => cloneToPurchaseOrder(purchaseOrder)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone')}
      </DropdownElement>
    ),
    () => isEditPage && <Divider withoutPadding />,
    (purchaseOrder) =>
      Boolean(!purchaseOrder.archived_at) &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk(purchaseOrder.id, 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (purchaseOrder) =>
      Boolean(purchaseOrder.archived_at) &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk(purchaseOrder.id, 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (purchaseOrder) =>
      !purchaseOrder.is_deleted &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk(purchaseOrder.id, 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}
