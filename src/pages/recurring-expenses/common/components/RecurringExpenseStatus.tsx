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
import { StatusBadge } from '$app/components/StatusBadge';
import recurringExpenseStatus from '$app/common/constants/recurring-expense';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';

interface Props {
  recurringExpense: RecurringExpense;
}

export function RecurringExpenseStatus(props: Props) {
  const [t] = useTranslation();

  const { recurringExpense } = props;

  if (recurringExpense.remaining_cycles === 0)
    return <Badge variant="green">{t('completed')}</Badge>;

  return (
    <StatusBadge
      for={recurringExpenseStatus}
      code={recurringExpense.status_id}
    />
  );
}
