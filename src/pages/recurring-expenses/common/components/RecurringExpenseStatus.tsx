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

interface Props {
  recurringExpense: RecurringExpense;
}

export function RecurringExpenseStatus(props: Props) {
  const { recurringExpense } = props;

  return (
    <StatusBadge
      for={recurringExpenseStatus}
      code={recurringExpense.status_id}
    />
  );
}
