/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EntityState } from '$app/common/enums/entity-state';
import { date, getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Product } from '$app/common/interfaces/product';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { EntityStatus } from '$app/components/EntityStatus';
import { Icon } from '$app/components/icons/Icon';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdRestore,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { productAtom } from './atoms';
import { bulk } from '$app/common/queries/products';
import { Divider } from '$app/components/cards/Divider';
import { Tooltip } from '$app/components/Tooltip';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useSetAtom } from 'jotai';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { BiPlusCircle } from 'react-icons/bi';
import { useInvoiceProducts } from './hooks/useInvoiceProducts';
import { usePurchaseOrderProducts } from './hooks/usePurchaseOrderProducts';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';

export const defaultColumns: string[] = [
  'product_key',
  'description',
  'price',
  'quantity',
];

export function useAllProductColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'product',
    });

  const productColumns = [
    'product_key',
    'description',
    'price',
    'quantity',
    'archived_at',
    // 'assigned_to', @Todo: Relationship not included.
    'created_at',
    // 'created_by', @Todo: Relationship not included.
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
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

  return productColumns;
}

export function useProductColumns() {
  const { t } = useTranslation();

  const productColumns = useAllProductColumns();
  type ProductColumns = (typeof productColumns)[number];

  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const reactSettings = useReactSettings();
  const disableNavigation = useDisableNavigation();
  const formatCustomFieldValue = useFormatCustomFieldValue();

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'product',
    });

  const columns: DataTableColumnsExtended<Product, ProductColumns> = [
    {
      column: 'product_key',
      id: 'product_key',
      label: t('product'),
      format: (value, product) => (
        <span className="inline-flex items-center space-x-4">
          <EntityStatus entity={product} />

          <DynamicLink
            to={route('/products/:id/edit', { id: product.id })}
            renderSpan={disableNavigation('product', product)}
          >
            {value}
          </DynamicLink>
        </span>
      ),
    },
    {
      column: 'description',
      id: 'notes',
      label: t('notes'),
      format: (value) => {
        return (
          <Tooltip
            size="regular"
            truncate
            containsUnsafeHTMLTags
            message={value as string}
          >
            <span dangerouslySetInnerHTML={{ __html: value as string }} />
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
          product.company?.settings.country_id,
          product.company?.settings.currency_id
        ),
    },
    {
      column: 'quantity',
      id: 'quantity',
      label: t('default_quantity'),
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
      column: firstCustom,
      id: 'custom_value1',
      label: firstCustom,
      format: (value) => formatCustomFieldValue('product1', value?.toString()),
    },
    {
      column: secondCustom,
      id: 'custom_value2',
      label: secondCustom,
      format: (value) => formatCustomFieldValue('product2', value?.toString()),
    },
    {
      column: thirdCustom,
      id: 'custom_value3',
      label: thirdCustom,
      format: (value) => formatCustomFieldValue('product3', value?.toString()),
    },
    {
      column: fourthCustom,
      id: 'custom_value4',
      label: fourthCustom,
      format: (value) => formatCustomFieldValue('product4', value?.toString()),
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
      id: 'in_stock_quantity',
      label: t('stock_quantity'),
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
    reactSettings?.react_table_columns?.product || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function useActions() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const hasPermission = useHasPermission();

  const setProduct = useSetAtom(productAtom);

  const invoiceProducts = useInvoiceProducts();

  const purchaseOrderProducts = usePurchaseOrderProducts();

  const { isEditPage } = useEntityPageIdentifier({
    entity: 'product',
    editPageTabs: ['documents', 'product_fields'],
  });

  const cloneToProduct = (product: Product) => {
    setProduct({ ...product, id: '', documents: [] });

    navigate('/products/create?action=clone');
  };

  const handleResourcefulAction = (
    action: 'archive' | 'restore' | 'delete',
    id: string
  ) => {
    toast.processing();

    bulk([id], action).then(() => {
      toast.success(`${action}d_product`);

      $refetch(['products']);
    });
  };

  const actions = [
    (product: Product) =>
      !product.is_deleted &&
      hasPermission('create_invoice') && (
        <DropdownElement
          onClick={() => invoiceProducts([product])}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_invoice')}
        </DropdownElement>
      ),
    (product: Product) =>
      !product.is_deleted &&
      hasPermission('create_purchase_order') && (
        <DropdownElement
          onClick={() => purchaseOrderProducts([product])}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_purchase_order')}
        </DropdownElement>
      ),
    (product: Product) =>
      !product.is_deleted &&
      hasPermission('create_product') && (
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
