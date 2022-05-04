/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { useRecurringInvoiceQuery } from 'common/queries/recurring-invoices';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { InvoiceViewer } from 'pages/invoices/common/components/InvoiceViewer';
import { generatePath, useParams } from 'react-router-dom';
import { useGeneratePdfUrl } from '../common/hooks/useGeneratePdfUrl';

export function Pdf() {
  const { documentTitle } = useTitle('view_pdf');
  const { id } = useParams();
  const { data: recurringInvoice, isLoading } = useRecurringInvoiceQuery({
    id,
  });
  const url = useGeneratePdfUrl();

  return (
    <Default
      title={documentTitle}
      onBackClick={generatePath('/recurring_invoices')}
    >
      {isLoading && <Spinner />}

      {recurringInvoice && (
        <InvoiceViewer
          link={url(recurringInvoice.data.data as RecurringInvoice) as string}
          method="GET"
        />
      )}
    </Default>
  );
}
