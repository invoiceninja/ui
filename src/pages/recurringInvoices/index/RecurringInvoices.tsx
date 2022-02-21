/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function RecurringInvoices() {
  const [t] = useTranslation();

  const pages: BreadcrumRecord[] = [{ name: t('payments'), href: '/payments' }];

  return (
    <Default breadcrumbs={pages} docsLink="docs/recurring-invoices/"></Default>
  );
}
