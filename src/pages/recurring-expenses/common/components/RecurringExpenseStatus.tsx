/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';
import { RecurringExpenseStatus as RecurringExpenseStatusEnum } from '$app/common/enums/recurring-expense-status';
import { useStatusThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';

interface Props {
  recurringExpense: RecurringExpense;
}

export function RecurringExpenseStatus(props: Props) {
  const [t] = useTranslation();

  const { recurringExpense } = props;

  const statusThemeColors = useStatusThemeColorScheme();

  const { is_deleted, archived_at, status_id } = recurringExpense;

  if (is_deleted) {
    return <Badge variant="red">{t('deleted')}</Badge>;
  }

  if (archived_at) {
    return <Badge variant="orange">{t('archived')}</Badge>;
  }

  if (RecurringExpenseStatusEnum.Draft === status_id) {
    return <Badge variant="generic">{t('draft')}</Badge>;
  }

  if (RecurringExpenseStatusEnum.Active === status_id) {
    return (
      <Badge variant="blue" style={{ backgroundColor: statusThemeColors.$3 }}>
        {t('active')}
      </Badge>
    );
  }

  if (RecurringExpenseStatusEnum.Paused === status_id) {
    return <Badge variant="yellow">{t('paused')}</Badge>;
  }

  if (RecurringExpenseStatusEnum.Pending === status_id) {
    return (
      <Badge
        variant="light-blue"
        style={{ backgroundColor: statusThemeColors.$2 }}
      >
        {t('pending')}
      </Badge>
    );
  }

  if (RecurringExpenseStatusEnum.Completed === status_id) {
    return (
      <Badge variant="green" style={{ backgroundColor: statusThemeColors.$1 }}>
        {t('completed')}
      </Badge>
    );
  }

  return <></>;
}
