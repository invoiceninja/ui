/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Badge } from 'components/Badge';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'components/StatusBadge';
import recurringExpenseStatus from 'common/constants/recurring-expense';
import { RecurringExpense } from 'common/interfaces/recurring-expense';

interface Props {
  recurringExpense: RecurringExpense;
}

export function RecurringExpenseStatus(props: Props) {
  const [t] = useTranslation();

  if (props.recurringExpense.remaining_cycles === 0)
    return <Badge variant="green">{t('completed')}</Badge>;

  return (
    <StatusBadge
      for={recurringExpenseStatus}
      code={props.recurringExpense.status_id}
    />
  );
}
