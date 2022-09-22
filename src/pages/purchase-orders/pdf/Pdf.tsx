/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { useTitle } from 'common/hooks/useTitle';
import { Default } from 'components/layouts/Default';
import { InvoiceViewer } from 'pages/invoices/common/components/InvoiceViewer';
import { useGeneratePdfUrl } from 'pages/invoices/common/hooks/useGeneratePdfUrl';
import { generatePath, useParams } from 'react-router-dom';
import { usePurchaseOrderQuery } from '../common/queries';

export function Pdf() {
  const { documentTitle } = useTitle('view_pdf');
  const { id } = useParams();
  const { data: purchaseOrder } = usePurchaseOrderQuery({ id });

  const url = useGeneratePdfUrl({ resourceType: 'purchase_order' });

  return (
    <Default
      title={documentTitle}
      onBackClick={route('/purchase_orders/:id/edit', { id })}
    >
      {purchaseOrder && (
        <InvoiceViewer link={url(purchaseOrder) as string} method="GET" />
      )}
    </Default>
  );
}
