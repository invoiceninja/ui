/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date as formatDate } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useFormatNumber } from '$app/common/hooks/useFormatNumber';
import { useTranslation } from 'react-i18next';
import { BurnUpData } from './burn-up';
import { BurnUpStat } from './BurnUpStat';

interface Props {
  data: BurnUpData;
}

export function BurnUpSummary({ data }: Props) {
  const [t] = useTranslation();

  const formatNumber = useFormatNumber();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const { summary } = data;

  const formatHours = (value: number): string => {
    return formatNumber(Number(value.toFixed(1))).toString();
  };

  const formatPercent = (value: number): string => {
    return `${formatNumber(Math.round(value))}%`;
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5 pt-2">
      <BurnUpStat
        label={t('percent_complete')}
        value={formatPercent(summary.percentComplete)}
        detail={
          summary.targetPercent !== null
            ? `${t('target')}: ${formatPercent(summary.targetPercent)}`
            : undefined
        }
      />

      <BurnUpStat
        label={t('logged')}
        value={formatHours(summary.loggedHours)}
        detail={
          data.hasScope
            ? `${t('of')} ${formatHours(summary.scopeHours)} ${t('hours')}`
            : t('hours')
        }
      />

      <BurnUpStat
        label={t('remaining')}
        value={data.hasScope ? formatHours(summary.remainingHours) : '—'}
        detail={t('hours')}
      />

      <BurnUpStat
        label={t('active_tasks')}
        value={formatNumber(summary.activeTaskCount)}
        detail={
          summary.runningTaskCount > 0
            ? `${formatNumber(summary.runningTaskCount)} ${t('running')}`
            : `${formatNumber(summary.invoicedTaskCount)} ${t('invoiced')}`
        }
      />

      <BurnUpStat
        label={t('projected_completion')}
        value={
          summary.projectedCompletion
            ? formatDate(summary.projectedCompletion, dateFormat)
            : '—'
        }
        detail={
          summary.dueDate
            ? `${t('due_date')}: ${formatDate(summary.dueDate, dateFormat)}`
            : undefined
        }
      />
    </div>
  );
}
