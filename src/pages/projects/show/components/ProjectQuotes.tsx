/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ModuleBitmask } from '$app/common/enums/module-bitmask';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { permission } from '$app/common/guards/guards/permission';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Project } from '$app/common/interfaces/project';
import { DataTable } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import {
  defaultColumns,
  useActions,
  useAllQuoteColumns,
  useQuoteColumns,
  useQuoteFilters,
} from '$app/pages/quotes/common/hooks';
import { useCustomBulkActions } from '$app/pages/quotes/common/hooks/useCustomBulkActions';
import { useFooterColumns } from '$app/pages/quotes/common/hooks/useFooterColumns';

interface Props {
  project: Project;
}

export const useShowProjectQuotes = () => {
  const enabled = useEnabled();
  const hasPermission = useHasPermission();

  return (
    enabled(ModuleBitmask.Quotes) &&
    (hasPermission('view_quote') || hasPermission('edit_quote'))
  );
};

export function ProjectQuotes({ project }: Props) {
  const hasPermission = useHasPermission();
  const showQuotes = useShowProjectQuotes();

  const actions = useActions();
  const filters = useQuoteFilters();
  const columns = useQuoteColumns();
  const quoteColumns = useAllQuoteColumns();
  const { footerColumns } = useFooterColumns();
  const customBulkActions = useCustomBulkActions();

  if (!showQuotes) {
    return null;
  }

  return (
    <DataTable
      resource="quote"
      columns={columns}
      footerColumns={footerColumns}
      customActions={actions}
      endpoint={`/api/v1/quotes?include=client&without_deleted_clients=true&sort=id|desc&project_id=${project.id}`}
      bulkRoute="/api/v1/quotes/bulk"
      linkToCreate={route(
        '/quotes/create?client=:clientId&project_id=:projectId',
        {
          clientId: project.client_id,
          projectId: project.id,
        }
      )}
      linkToEdit="/quotes/:id/edit"
      customFilters={filters}
      customBulkActions={customBulkActions}
      customFilterPlaceholder="status"
      withResourcefulActions
      rightSide={
        <DataTableColumnsPicker
          columns={quoteColumns as unknown as string[]}
          defaultColumns={defaultColumns}
          table="quote"
        />
      }
      linkToCreateGuards={[permission('create_quote')]}
      hideEditableOptions={!hasPermission('edit_quote')}
    />
  );
}
