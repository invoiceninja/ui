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
import { Default } from '$app/components/layouts/Default';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useGeneratePdfUrl } from '$app/pages/invoices/common/hooks/useGeneratePdfUrl';
import { useParams } from 'react-router-dom';
import { useRecurringInvoiceQuery } from '../common/queries';
import { Page } from '$app/components/Breadcrumbs';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';

export default function Pdf() {
  const { documentTitle } = useTitle('view_pdf');
  const { id } = useParams();
  const { t } = useTranslation();
  const { data: recurringInvoice } = useRecurringInvoiceQuery({ id: id! });

  const url = useGeneratePdfUrl({ resourceType: 'recurring_invoice' });

  const pages: Page[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
    {
      name: t('edit_recurring_invoice'),
      href: route('/recurring_invoices/:id/edit', { id }),
    },
    {
      name: t('pdf'),
      href: route('/recurring_invoices/:id/pdf', { id }),
    },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      {recurringInvoice && (
        <InvoiceViewer link={url(recurringInvoice) as string} method="GET" />
      )}
    </Default>
  );
}
