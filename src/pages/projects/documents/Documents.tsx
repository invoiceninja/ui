/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { route } from 'common/helpers/route';
import { useProjectQuery } from 'common/queries/projects';
import { DocumentsTable } from 'components/DocumentsTable';
import { Upload } from 'pages/settings/company/documents/components';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

export function Documents() {
  const { id } = useParams();

  const { data: project } = useProjectQuery({ id });
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries(route('/api/v1/projects/:id', { id }));
  };

  return (
    <>
      <Upload
        endpoint={endpoint('/api/v1/projects/:id/upload', { id })}
        onSuccess={onSuccess}
      />

      <DocumentsTable
        documents={project?.documents || []}
        onDocumentDelete={onSuccess}
      />
    </>
  );
}
