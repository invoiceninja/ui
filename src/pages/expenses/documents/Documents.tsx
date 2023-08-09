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
import { route } from '$app/common/helpers/route';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useQueryClient } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { Context } from '../edit/Edit';

export default function Documents() {
  const context: Context = useOutletContext();

  const { expense } = context;

  const queryClient = useQueryClient();

  const invalidateCache = () => {
    queryClient.invalidateQueries(
      route('/api/v1/expenses/:id', { id: expense.id })
    );
  };

  return (
    <div className="w-2/3">
      <Upload
        widgetOnly
        endpoint={endpoint('/api/v1/expenses/:id/upload', { id: expense.id })}
        onSuccess={invalidateCache}
      />

      <DocumentsTable
        documents={expense?.documents || []}
        onDocumentDelete={invalidateCache}
      />
    </div>
  );
}
