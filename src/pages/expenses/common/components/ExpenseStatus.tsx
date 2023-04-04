/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';
import { Expense } from '$app/common/interfaces/expense';
import { ResourceItem } from '$app/pages/transactions/components/ListBox';

interface Props {
  entity: Expense | ResourceItem;
}

export function ExpenseStatus(props: Props) {
  const [t] = useTranslation();

  const {
    invoice_id,
    should_be_invoiced,
    payment_date,
    payment_type_id,
    transaction_reference,
    archived_at,
    is_deleted,
  } = props.entity;

  const isInvoiced = Boolean(invoice_id);

  const isPaid = payment_date || payment_type_id || transaction_reference;

  if (is_deleted) {
    return <Badge variant="red">{t('deleted')}</Badge>;
  }

  if (archived_at) {
    return <Badge variant="orange">{t('archived')}</Badge>;
  }

  if (isInvoiced) {
    return <Badge variant="dark-blue">{t('invoiced')}</Badge>;
  }

  if (should_be_invoiced)
    return <Badge variant="light-blue">{t('pending')}</Badge>;

  if (isPaid) return <Badge variant="green">{t('paid')}</Badge>;

  return <Badge variant="generic">{t('logged')}</Badge>;
}
