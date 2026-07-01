/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  TAG_ENTITY_TYPES,
  TAG_ENTITY_TYPE_OPTIONS,
  TAG_ENTITY_TYPE_VALUES,
  Tag,
  TagEntityType,
  resolveTagEntityType,
} from '$app/common/interfaces/tag';
import { Badge } from '$app/components/Badge';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { SelectOption } from '$app/components/datatables/Actions';
import { Icon } from '$app/components/icons/Icon';
import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { Link } from '$app/components/forms';
import { Settings } from '$app/components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { MdEdit } from 'react-icons/md';

function TagsTable() {
  const [t] = useTranslation();

  const getEditRoute = () => '/settings/tags/:id/edit';

  const getEntityTypeLabel = (entityType: string) => {
    return t(resolveTagEntityType(entityType));
  };

  const getEntityTypeBadgeVariant = (entityType: string) => {
    const resolvedEntityType = resolveTagEntityType(entityType);

    if (resolvedEntityType === TAG_ENTITY_TYPES.project) {
      return 'light-blue';
    }

    if (resolvedEntityType === TAG_ENTITY_TYPES.task) {
      return 'generic';
    }

    return 'teal';
  };

  const getEntityTypeFilterColor = (entityType: TagEntityType) => {
    if (entityType === TAG_ENTITY_TYPES.global) {
      return '#0D9488';
    }

    if (entityType === TAG_ENTITY_TYPES.project) {
      return '#93C5FD';
    }

    if (entityType === TAG_ENTITY_TYPES.task) {
      return '#6B7280';
    }

    return '#64748B';
  };

  const columns: DataTableColumns<Tag> = [
    {
      id: 'name',
      label: t('name'),
      format: (value, tag) => (
        <Link to={route(getEditRoute(), { id: tag.id })}>{value}</Link>
      ),
    },
    {
      id: 'entity_type',
      label: t('type'),
      format: (value) => (
        <Badge variant={getEntityTypeBadgeVariant(value as string)}>
          {getEntityTypeLabel(value as string)}
        </Badge>
      ),
    },
    {
      id: 'color',
      label: t('color'),
      format: (value) => (
        <div
          className="h-4 w-10 rounded-sm border border-gray-300"
          style={{ backgroundColor: value ? value.toString() : 'transparent' }}
        />
      ),
    },
  ];

  const filters: SelectOption[] = TAG_ENTITY_TYPE_OPTIONS.map(
    ({ labelKey, value }) => ({
      label: t(labelKey),
      value,
      color: 'white',
      backgroundColor: getEntityTypeFilterColor(value),
      queryKey: 'entity_types',
    })
  );

  return (
    <DataTable
      resource="tag"
      columns={columns}
      endpoint="/api/v1/tags?sort=name|asc"
      bulkRoute="/api/v1/tags/bulk"
      customActions={[
        (tag: Tag) => (
          <DropdownElement
            to={route(getEditRoute(), { id: tag.id })}
            icon={<Icon element={MdEdit} />}
          >
            {t('edit')}
          </DropdownElement>
        ),
      ]}
      customFilters={filters}
      defaultCustomFilterValues={TAG_ENTITY_TYPE_VALUES}
      customFilterPlaceholder="type"
      linkToCreate="/settings/tags/create"
      withResourcefulActions
      enableSavingFilterPreference
    />
  );
}

export function Tags() {
  useTitle('tags');

  const [t] = useTranslation();
  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('tags'), href: '/settings/tags' },
  ];

  const tabs = [
    { name: t('clients'), href: '/settings/tags' },
    { name: t('products'), href: '/settings/tags/products' },
    { name: t('invoices'), href: '/settings/tags/invoices' },
    {
      name: t('recurring_invoices'),
      href: '/settings/tags/recurring_invoices',
    },
    { name: t('payments'), href: '/settings/tags/payments' },
    { name: t('quotes'), href: '/settings/tags/quotes' },
    { name: t('credits'), href: '/settings/tags/credits' },
    { name: t('projects'), href: '/settings/tags/projects' },
    { name: t('tasks'), href: '/settings/tags/tasks' },
    { name: t('vendors'), href: '/settings/tags/vendors' },
    { name: t('purchase_orders'), href: '/settings/tags/purchase_orders' },
    { name: t('expenses'), href: '/settings/tags/expenses' },
    {
      name: t('recurring_expenses'),
      href: '/settings/tags/recurring_expenses',
    },
    { name: t('transactions'), href: '/settings/tags/transactions' },
  ];

  return (
    <Settings title={t('tags')} breadcrumbs={pages}>
      <TagsTable />
    </Settings>
  );
}

export function TaskTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.task}
      createRoute="/settings/tags/tasks/create"
      editRoute="/settings/tags/tasks/:id/edit"
    />
  );
}

export function ProjectTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.project}
      createRoute="/settings/tags/projects/create"
      editRoute="/settings/tags/projects/:id/edit"
    />
  );
}

export function InvoiceTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.invoice}
      createRoute="/settings/tags/invoices/create"
      editRoute="/settings/tags/invoices/:id/edit"
    />
  );
}

export function QuoteTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.quote}
      createRoute="/settings/tags/quotes/create"
      editRoute="/settings/tags/quotes/:id/edit"
    />
  );
}

export function CreditTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.credit}
      createRoute="/settings/tags/credits/create"
      editRoute="/settings/tags/credits/:id/edit"
    />
  );
}

export function ExpenseTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.expense}
      createRoute="/settings/tags/expenses/create"
      editRoute="/settings/tags/expenses/:id/edit"
    />
  );
}

export function TransactionTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.bank_transaction}
      createRoute="/settings/tags/transactions/create"
      editRoute="/settings/tags/transactions/:id/edit"
    />
  );
}

export function RecurringInvoiceTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.recurring_invoice}
      createRoute="/settings/tags/recurring_invoices/create"
      editRoute="/settings/tags/recurring_invoices/:id/edit"
    />
  );
}

export function RecurringExpenseTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.recurring_expense}
      createRoute="/settings/tags/recurring_expenses/create"
      editRoute="/settings/tags/recurring_expenses/:id/edit"
    />
  );
}

export function ClientTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.client}
      createRoute="/settings/tags/clients/create"
      editRoute="/settings/tags/clients/:id/edit"
    />
  );
}

export function VendorTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.vendor}
      createRoute="/settings/tags/vendors/create"
      editRoute="/settings/tags/vendors/:id/edit"
    />
  );
}

export function PaymentTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.payment}
      createRoute="/settings/tags/payments/create"
      editRoute="/settings/tags/payments/:id/edit"
    />
  );
}

export function PurchaseOrderTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.purchase_order}
      createRoute="/settings/tags/purchase_orders/create"
      editRoute="/settings/tags/purchase_orders/:id/edit"
    />
  );
}

export function ProductTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.product}
      createRoute="/settings/tags/products/create"
      editRoute="/settings/tags/products/:id/edit"
    />
  );
}
