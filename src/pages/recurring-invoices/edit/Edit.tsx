/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Edit() {
  const { documentTitle } = useTitle('edit_recurring_invoice');
  const [t] = useTranslation();
  const { id } = useParams();

  const pages: BreadcrumRecord[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
    {
      name: t('edit_recurring_invoice'),
      href: generatePath('/recurring_invoices/:id/edit', { id }),
    },
  ];

  return <Default title={documentTitle} breadcrumbs={pages}></Default>;
}
