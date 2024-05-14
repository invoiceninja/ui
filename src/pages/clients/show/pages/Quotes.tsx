/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { DataTable } from '$app/components/DataTable';
import { useParams } from 'react-router-dom';
import { useActions, useQuoteColumns } from '$app/pages/quotes/common/hooks';
import { useCustomBulkActions } from '$app/pages/quotes/common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { permission } from '$app/common/guards/guards/permission';
import { useFooterColumns } from '$app/pages/quotes/common/hooks/useFooterColumns';

export default function Quotes() {
  const { id } = useParams();

  const hasPermission = useHasPermission();

  const actions = useActions();
  const columns = useQuoteColumns();
  const { footerColumns } = useFooterColumns();
  const customBulkActions = useCustomBulkActions();

  return (
    <DataTable
      resource="quote"
      endpoint={route(
        '/api/v1/quotes?include=client&client_id=:id&sort=id|desc',
        { id }
      )}
      columns={columns}
      footerColumns={footerColumns}
      customActions={actions}
      customBulkActions={customBulkActions}
      withResourcefulActions
      bulkRoute="/api/v1/quotes/bulk"
      linkToCreate={route('/quotes/create?client=:id', { id })}
      linkToEdit="/quotes/:id/edit"
      excludeColumns={['client_id']}
      linkToCreateGuards={[permission('create_quote')]}
      hideEditableOptions={!hasPermission('edit_quote')}
    />
  );
}
