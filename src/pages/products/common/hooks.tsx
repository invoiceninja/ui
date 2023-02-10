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
import { EntityState } from 'common/enums/entity-state';
import { date, getEntityState } from 'common/helpers';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { Product } from 'common/interfaces/product';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { customField } from 'components/CustomField';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { EntityStatus } from 'components/EntityStatus';
import { Icon } from 'components/icons/Icon';
import { useUpdateAtom } from 'jotai/utils';
import { DataTableColumnsExtended } from 'pages/invoices/common/hooks/useInvoiceColumns';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdRestore,
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { productAtom } from './atoms';
import { bulk } from 'common/queries/products';
import { useQueryClient } from 'react-query';
import { Divider } from 'components/cards/Divider';
import { Tooltip } from 'components/Tooltip';

export const productColumns = [
  'product_key',
  'description',
  'price',
  'quantity',
  'archived_at',
  // 'assigned_to', @Todo: Relationship not included.
  'created_at',
  // 'created_by', @Todo: Relationship not included.
  'custom1',
  'custom2',
  'custom3',
  'custom4',
  'documents',
  'entity_state',
  'is_deleted',
  'notification_threshold',
  'stock_quantity',
  'tax_name1',
  'tax_name2',
  'tax_name3',
  'tax_rate1',
  'tax_rate2',
  'tax_rate3',
  'updated_at',
] as const;

type ProductColumns = typeof productColumns[number];

export const defaultColumns: ProductColumns[] = [
  'product_key',
  'description',
  'price',
  'quantity',
];

export function useProductColumns() {
  const { t } = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const company = useCurrentCompany();
  const currentUser = useCurrentUser();
  const formatMoney = useFormatMoney();

  const columns: DataTableColumnsExtended<Product, ProductColumns> = [
    {
      column: 'product_key',
      id: 'product_key',
      label: t('product'),
      format: (value, product) => (
        <span className="inline-flex items-center space-x-4">
          <EntityStatus entity={product} />

          <Link to={route('/products/:id/edit', { id: product.id })}>
            {value}
          </Link>
        </span>
      ),
    },
    {
      column: 'description',
      id: 'notes',
      label: t('notes'),
      format: (value) => {
        return (
          <Tooltip size="regular" truncate message={value as string}>
            <span>{value}</span>
          </Tooltip>
        );
      },
    },
    {
      column: 'price',
      id: 'price',
      label: t('price'),
      format: (value, product) =>
        formatMoney(
          value,
          product.company?.settings.country_id || company.settings.country_id,
          product.company?.settings.currency_id || company.settings.currency_id
        ),
    },
    {
      column: 'quantity',
      id: 'quantity',
      label: t('quantity'),
    },
    {
      column: 'archived_at',
      id: 'archived_at',
      label: t('archived_at'),
      format: (value) => date(value, dateFormat),
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
        (company?.custom_fields.product1 &&
          customField(company?.custom_fields.product1).label()) ||
        t('first_custom'),
    },
    {
      column: 'custom2',
      id: 'custom_value2',
      label:
        (company?.custom_fields.product2 &&
          customField(company?.custom_fields.product2).label()) ||
        t('second_custom'),
    },
    {
      column: 'custom3',
      id: 'custom_value3',
      label:
        (company?.custom_fields.product3 &&
          customField(company?.custom_fields.product3).label()) ||
        t('third_custom'),
    },
    {
      column: 'custom4',
      id: 'custom_value4',
      label:
        (company?.custom_fields.product4 &&
          customField(company?.custom_fields.product4).label()) ||
        t('forth_custom'),
    },
    {
      column: 'documents',
      id: 'documents',
      label: t('documents'),
      format: (value, product) => product.documents.length,
    },
    {
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, product) => <EntityStatus entity={product} />,
    },
    {
      column: 'is_deleted',
      id: 'is_deleted',
      label: t('is_deleted'),
      format: (value, product) => (product.is_deleted ? t('yes') : t('no')),
    },
    {
      column: 'notification_threshold',
      id: 'stock_notification_threshold',
      label: t('notification_threshold'),
    },
    {
      column: 'stock_quantity',
      id: 'quantity',
      label: t('quantity'),
    },
    {
      column: 'tax_name1',
      id: 'tax_name1',
      label: t('tax_name1'),
    },
    {
      column: 'tax_name2',
      id: 'tax_name2',
      label: t('tax_name2'),
    },
    {
      column: 'tax_name3',
      id: 'tax_name3',
      label: t('tax_name3'),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('updated_at'),
      format: (value) => date(value, dateFormat),
    },
  ];

  const list: string[] =
    currentUser?.company_user?.settings?.react_table_columns?.product ||
    defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function useActions() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const location = useLocation();

  const queryClient = useQueryClient();

  const setProduct = useUpdateAtom(productAtom);

  const isEditPage = location.pathname.endsWith('/edit');

  const cloneToProduct = (product: Product) => {
    setProduct({ ...product, id: '', documents: [] });

    navigate('/products/create?action=clone');
  };

  const handleResourcefulAction = (
    action: 'archive' | 'restore' | 'delete',
    id: string
  ) => {
    toast.processing();

    bulk([id], action)
      .then(() => {
        toast.success(t(`${action}d_product`) || '');

        queryClient.invalidateQueries(route('/api/v1/products/:id', { id }));
      })
      .catch((error) => {
        console.error(error);
        toast.error();
      });
  };

  const actions = [
    (product: Product) => (
      <DropdownElement
        onClick={() => cloneToProduct(product)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone')}
      </DropdownElement>
    ),
    () => isEditPage && <Divider withoutPadding />,
    (product: Product) =>
      getEntityState(product) === EntityState.Active &&
      isEditPage && (
        <DropdownElement
          onClick={() => handleResourcefulAction('archive', product.id)}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (product: Product) =>
      (getEntityState(product) === EntityState.Archived ||
        getEntityState(product) === EntityState.Deleted) &&
      isEditPage && (
        <DropdownElement
          onClick={() => handleResourcefulAction('restore', product.id)}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (product: Product) =>
      (getEntityState(product) === EntityState.Active ||
        getEntityState(product) === EntityState.Archived) &&
      isEditPage && (
        <DropdownElement
          onClick={() => handleResourcefulAction('delete', product.id)}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setProduct: Dispatch<SetStateAction<Product | undefined>>;
}

export function useHandleChange(params: Params) {
  const { setErrors, setProduct } = params;

  return (property: keyof Product, value: Product[keyof Product]) => {
    setErrors(undefined);

    setProduct((product) => product && { ...product, [property]: value });
  };
}
