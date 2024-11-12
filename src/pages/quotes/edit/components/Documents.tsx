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
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { QuoteContext } from '../../create/Create';

export default function Documents() {
  const [t] = useTranslation();

  const location = useLocation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();

  const context: QuoteContext = useOutletContext();

  const { quote } = context;

  return (
    <Card title={t('documents')} className="w-full xl:w-2/3">
      {location.pathname.includes('/create') ? (
        <div className="text-sm mt-4 px-6">
          {t('save_to_upload_documents')}.
        </div>
      ) : (
        <div className="px-6">
          <Upload
            widgetOnly
            endpoint={endpoint('/api/v1/quotes/:id/upload', {
              id,
            })}
            onSuccess={() => $refetch(['quotes'])}
            disableUpload={
              !hasPermission('edit_quote') && !entityAssigned(quote)
            }
          />

          <DocumentsTable
            documents={quote?.documents || []}
            onDocumentDelete={() => $refetch(['quotes'])}
            disableEditableOptions={
              !entityAssigned(quote, true) && !hasPermission('edit_quote')
            }
          />
        </div>
      )}
    </Card>
  );
}
