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
import { useColorScheme } from '$app/common/colors';
import classNames from 'classnames';

export default function Documents() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const context: ClientContext = useOutletContext();
  const { client } = context;

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const onSuccess = () => {
    $refetch(['clients']);
  };

  return (
    <Card
      title={t('documents')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <div
        className={classNames('flex w-full px-6 py-2', {
          'flex-col items-center': id,
        })}
      >
        {id ? (
          <>
            <div className="w-full lg:w-2/3">
              <Upload
                widgetOnly
                endpoint={endpoint('/api/v1/clients/:id/upload', { id })}
                onSuccess={onSuccess}
              />
            </div>

            <div className="w-full lg:w-2/3">
              <DocumentsTable
                documents={client?.documents || []}
                onDocumentDelete={onSuccess}
                disableEditableOptions={
                  !entityAssigned(client, true) && !hasPermission('edit_client')
                }
              />
            </div>
          </>
        ) : (
          <div className="text-sm">{t('save_to_upload_documents')}.</div>
        )}
      </div>
    </Card>
  );
}
