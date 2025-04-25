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
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { $refetch } from '$app/common/hooks/useRefetch';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useLocation, useOutletContext, useParams } from 'react-router-dom';
import { Context } from '../Edit';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';

export default function Documents() {
  const [t] = useTranslation();

  const location = useLocation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();

  const context: Context = useOutletContext();

  const { invoice } = context;

  return (
    <Card title={t('documents')}>
      <div className="flex flex-col items-center w-full px-4 sm:px-6 py-2">
        {location.pathname.includes('/create') ? (
          <div className="text-sm self-start">
            {t('save_to_upload_documents')}.
          </div>
        ) : (
          <>
            <div className="w-full lg:w-2/3">
              <Upload
                widgetOnly
                endpoint={endpoint('/api/v1/invoices/:id/upload', {
                  id,
                })}
                onSuccess={() => $refetch(['invoices'])}
                disableUpload={
                  !hasPermission('edit_invoice') && !entityAssigned(invoice)
                }
              />
            </div>

            <div className="w-full lg:w-2/3">
              <DocumentsTable
                documents={invoice?.documents || []}
                onDocumentDelete={() => $refetch(['invoices'])}
                disableEditableOptions={
                  !entityAssigned(invoice, true) &&
                  !hasPermission('edit_invoice')
                }
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
