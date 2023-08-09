/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import {
  defaultColumns,
  useActions,
  useAllQuoteColumns,
  useQuoteColumns,
  useQuoteFilters,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { ImportButton } from '$app/components/import/ImportButton';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';

export default function Quotes() {
  const { documentTitle } = useTitle('quotes');

  const [t] = useTranslation();

  const pages: Page[] = [{ name: t('quotes'), href: route('/quotes') }];

  const columns = useQuoteColumns();

  const actions = useActions();

  const quoteColumns = useAllQuoteColumns();

  const filters = useQuoteFilters();

  const customBulkActions = useCustomBulkActions();

  return (
    <Default title={documentTitle} breadcrumbs={pages} withoutBackButton>
      <DataTable
        resource="quote"
        columns={columns}
        endpoint="/api/v1/quotes?include=client&without_deleted_clients=true&sort=id|desc"
        linkToEdit="/quotes/:id/edit"
        linkToCreate="/quotes/create"
        bulkRoute="/api/v1/quotes/bulk"
        customActions={actions}
        customBulkActions={customBulkActions}
        customFilters={filters}
        customFilterPlaceholder="status"
        withResourcefulActions
        rightSide={
          <Guard
            type="component"
            guards={[or(permission('create_quote'), permission('edit_quote'))]}
            component={<ImportButton route="/quotes/import" />}
          />
        }
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={quoteColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="quote"
          />
        }
        linkToCreateGuards={[permission('create_quote')]}
      />
    </Default>
  );
}
