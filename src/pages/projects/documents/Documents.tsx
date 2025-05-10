/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useProjectQuery } from '$app/common/queries/projects';
import { Card } from '$app/components/cards';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export default function Documents() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { data: project } = useProjectQuery({ id });

  const onSuccess = () => {
    $refetch(['projects']);
  };

  return (
    <Card
      title={t('documents')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <div className="flex flex-col items-center w-full px-4 sm:px-6 py-2">
        <div className="w-full">
          <Upload
            endpoint={endpoint('/api/v1/projects/:id/upload', { id })}
            onSuccess={onSuccess}
            disableUpload={
              !hasPermission('edit_project') && !entityAssigned(project)
            }
            widgetOnly
          />
        </div>

        <div className="w-full">
          <DocumentsTable
            documents={project?.documents || []}
            onDocumentDelete={onSuccess}
            disableEditableOptions={
              !entityAssigned(project, true) && !hasPermission('edit_project')
            }
          />
        </div>
      </div>
    </Card>
  );
}
