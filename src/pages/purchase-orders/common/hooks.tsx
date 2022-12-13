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
import { customField } from 'components/CustomField';
import { EntityStatus } from 'components/EntityStatus';
import { StatusBadge } from 'components/StatusBadge';
import { DataTableColumnsExtended } from 'pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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

export const purchaseOrderColumns = [
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
  'custom1',
  'custom2',
  'custom3',
  'custom4',
  'discount',
  'documents',
  'entity_state',
  'exchange_rate',
] as const;

type PurchaseOrderColumns = typeof purchaseOrderColumns[number];

export const defaultColumns: PurchaseOrderColumns[] = [
  'status',
  'number',
  'vendor',
  'expense',
  'amount',
  'date',
  'due_date',
];

export function usePurchaseOrderColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const currentUser = useCurrentUser();
  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

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
            <Link to={route('/expenses/:id', { id: purchaseOrder.expense.id })}>
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
        column: 'custom1',
        id: 'custom_value1',
        label:
          (company?.custom_fields.invoice1 &&
            customField(company?.custom_fields.invoice1).label()) ||
          t('first_custom'),
      },
      {
        column: 'custom2',
        id: 'custom_value2',
        label:
          (company?.custom_fields.invoice2 &&
            customField(company?.custom_fields.invoice2).label()) ||
          t('second_custom'),
      },
      {
        column: 'custom3',
        id: 'custom_value3',
        label:
          (company?.custom_fields.invoice3 &&
            customField(company?.custom_fields.invoice3).label()) ||
          t('third_custom'),
      },
      {
        column: 'custom4',
        id: 'custom_value4',
        label:
          (company?.custom_fields.invoice4 &&
            customField(company?.custom_fields.invoice4).label()) ||
          t('forth_custom'),
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
