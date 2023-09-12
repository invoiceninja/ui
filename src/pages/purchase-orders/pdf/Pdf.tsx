/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { usePurchaseOrderQuery } from '$app/common/queries/purchase-orders';
import { Default } from '$app/components/layouts/Default';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useGeneratePdfUrl } from '$app/pages/invoices/common/hooks/useGeneratePdfUrl';
import { useParams } from 'react-router-dom';

export default function Pdf() {
  const { documentTitle } = useTitle('view_pdf');
  const { id } = useParams();
  const { data: purchaseOrder } = usePurchaseOrderQuery({ id });

  const url = useGeneratePdfUrl({ resourceType: 'purchase_order' });

  return (
    <Default title={documentTitle}>
      {purchaseOrder && (
        <InvoiceViewer link={url(purchaseOrder) as string} method="GET" />
      )}
    </Default>
  );
}
