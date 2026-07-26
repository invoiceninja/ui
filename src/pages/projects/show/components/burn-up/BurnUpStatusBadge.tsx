/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Badge, BadgeVariant } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';
import { BurnUpStatus } from './burn-up';

interface Props {
  status: BurnUpStatus;
}

const STATUS_VARIANT: Record<BurnUpStatus, BadgeVariant> = {
  not_started: 'generic',
  on_track: 'blue',
  ahead_of_schedule: 'green',
  behind_schedule: 'yellow',
  overdue: 'red',
  over_budget: 'red',
  completed: 'green',
};

export function BurnUpStatusBadge({ status }: Props) {
  const [t] = useTranslation();

  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}
