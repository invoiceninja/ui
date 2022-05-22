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
import { useCurrentRecurringInvoice } from 'common/hooks/useCurrentRecurringInvoice';
import { DocumentsTable } from 'components/DocumentsTable';
import { Upload } from 'pages/settings/company/documents/components';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';

export function InvoiceDocuments() {
  const { id } = useParams();

  const invoice = useCurrentRecurringInvoice();
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries(
      generatePath('/api/v1/recurring_invoices/:id', { id })
    );
  };

  return (
    <>
      <Upload
        widgetOnly
        endpoint={endpoint('/api/v1/recurring_invoices/:id/upload', { id })}
        onSuccess={onSuccess}
      />

      <DocumentsTable
        documents={invoice?.documents || []}
        onDocumentDelete={onSuccess}
      />
    </>
  );
}
