/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { StatusBadge } from '$app/components/StatusBadge';
import recurringExpenseStatus from '$app/common/constants/recurring-expense';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';

interface Props {
  recurringExpense: RecurringExpense;
}

export function RecurringExpenseStatus(props: Props) {
  const [t] = useTranslation();

  const { recurringExpense } = props;

  const { is_deleted, archived_at } = recurringExpense;

  if (is_deleted) {
    return <Badge variant="red">{t('deleted')}</Badge>;
  }

  if (archived_at) {
    return <Badge variant="orange">{t('archived')}</Badge>;
  }

  return (
    <StatusBadge
      for={recurringExpenseStatus}
      code={recurringExpense.status_id}
    />
  );
}
