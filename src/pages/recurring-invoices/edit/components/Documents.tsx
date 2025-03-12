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
import { RecurringInvoiceContext } from '../../create/Create';

export default function Documents() {
  const [t] = useTranslation();

  const location = useLocation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();

  const context: RecurringInvoiceContext = useOutletContext();

  const { recurringInvoice } = context;

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
            endpoint={endpoint('/api/v1/recurring_invoices/:id/upload', {
              id,
            })}
            onSuccess={() => $refetch(['recurring_invoices'])}
            disableUpload={
              !hasPermission('edit_recurring_invoice') &&
              !entityAssigned(recurringInvoice)
            }
          />

          <DocumentsTable
            documents={recurringInvoice?.documents || []}
            onDocumentDelete={() => $refetch(['recurring_invoices'])}
            disableEditableOptions={
              !entityAssigned(recurringInvoice, true) &&
              !hasPermission('edit_recurring_invoice')
            }
          />
        </div>
      )}
    </Card>
  );
}
