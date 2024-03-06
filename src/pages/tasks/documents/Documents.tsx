/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useOutletContext } from 'react-router-dom';
import { Context } from '../edit/Edit';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';

export default function Documents() {
  const context: Context = useOutletContext();

  const { task } = context;

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const invalidateCache = () => {
    $refetch(['tasks']);
  };

  return (
    <div className="w-full lg:w-2/3">
      <Upload
        widgetOnly
        endpoint={endpoint('/api/v1/tasks/:id/upload', { id: task?.id })}
        onSuccess={invalidateCache}
        disableUpload={!hasPermission('edit_task') && !entityAssigned(task)}
      />

      <DocumentsTable
        documents={task?.documents || []}
        onDocumentDelete={invalidateCache}
        disableEditableOptions={!entityAssigned(task, true)}
      />
    </div>
  );
}
