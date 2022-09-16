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
import { useRecurringInvoiceQuery } from 'common/queries/recurring-invoices';
import { Default } from 'components/layouts/Default';
import { useParams } from 'react-router-dom';

export function Edit() {
  const { id } = useParams();
  const { documentTitle } = useTitle('edit_recurring_invoice');
  const { data } = useRecurringInvoiceQuery({ id });

  return <Default title={documentTitle}></Default>;
}
