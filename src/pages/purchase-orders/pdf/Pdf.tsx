/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { usePurchaseOrderQuery } from '$app/common/queries/purchase-orders';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useGeneratePdfUrl } from '$app/pages/invoices/common/hooks/useGeneratePdfUrl';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export default function Pdf() {
  const { documentTitle } = useTitle('view_pdf');
  const { id } = useParams();
  const { data: purchaseOrder } = usePurchaseOrderQuery({ id });
  const { t } = useTranslation();

  const url = useGeneratePdfUrl({ resourceType: 'purchase_order' });

  const pages: Page[] = [
    { name: t('purchase_orders'), href: '/purchase_orders' },
    {
      name: t('edit_purchase_order'),
      href: route('/purchase_orders/:id/edit', { id }),
    },
    {
      name: t('pdf'),
      href: route('/purchase_orders/:id/pdf', { id }),
    },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      {purchaseOrder && (
        <InvoiceViewer link={url(purchaseOrder) as string} method="GET" />
      )}
    </Default>
  );
}
