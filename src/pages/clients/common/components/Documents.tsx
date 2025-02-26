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
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import { ClientContext } from '../../edit/Edit';
import { Upload } from '$app/pages/settings/company/documents/components';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

export default function Documents() {
  const [t] = useTranslation();

  const { id } = useParams();

  const context: ClientContext = useOutletContext();
  const { client } = context;

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const onSuccess = () => {
    $refetch(['clients']);
  };

  return (
    <Card title={t('documents')} className="w-full xl:w-2/3">
      {id ? (
        <div className="px-6">
          <Upload
            widgetOnly
            endpoint={endpoint('/api/v1/clients/:id/upload', { id })}
            onSuccess={onSuccess}
          />

          <DocumentsTable
            documents={client?.documents || []}
            onDocumentDelete={onSuccess}
            disableEditableOptions={
              !entityAssigned(client, true) && !hasPermission('edit_client')
            }
          />
        </div>
      ) : (
        <div className="px-6 text-sm">{t('save_to_upload_documents')}.</div>
      )}
    </Card>
  );
}
