/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { date as formatDate } from '$app/common/helpers';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Project } from '$app/common/interfaces/project';
import {
  ProjectEstimatedVsLoggedHours,
  ProjectForecastCompletion,
} from '$app/common/interfaces/project-analytics';
import {
  hasValue,
  resolveScheduleVariancePresentation,
  toNumber,
} from '../helpers';
import { useAnalyticsFieldLabel } from '../hooks/useAnalyticsFieldLabel';
import { AnalyticsValueFormatter } from './AnalyticsChartTooltip';
import { AnalyticsMetricTable } from './AnalyticsMetricTable';

interface Props {
  project: Project;
  forecast?: ProjectForecastCompletion;
  estimatedVsLogged?: ProjectEstimatedVsLoggedHours;
  formatter: AnalyticsValueFormatter;
  canViewFinancials: boolean;
}

export function ForecastSummary({
  project,
  forecast,
  estimatedVsLogged,
  formatter,
  canViewFinancials,
}: Props) {
  const [t] = useTranslation();

  const fieldLabel = useAnalyticsFieldLabel();
  const formatMoney = useFormatMoney();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const dueDate = project.due_date
    ? formatDate(project.due_date, dateFormat)
    : '-';

  const finishDate = forecast?.forecast_finish_date
    ? formatDate(forecast.forecast_finish_date, dateFormat)
    : '-';

  const scheduleVariance = resolveScheduleVariancePresentation(
    forecast?.schedule_variance_days
  );

  const rows = [
    {
      label: t('budgeted_hours'),
      value: formatter('hours', project.budgeted_hours),
    },
    ...(hasValue(estimatedVsLogged?.task_estimated_hours)
      ? [
          {
            label: t('estimated_hours'),
            value: formatter(
              'task_estimated_hours',
              estimatedVsLogged?.task_estimated_hours
            ),
          },
        ]
      : []),
    ...(hasValue(estimatedVsLogged?.logged_hours)
      ? [
          {
            label: t('logged_hours'),
            value: formatter('logged_hours', estimatedVsLogged?.logged_hours),
          },
        ]
      : []),
    ...(hasValue(estimatedVsLogged?.remaining_estimated_hours)
      ? [
          {
            label: t('remaining_estimated_hours'),
            value: formatter(
              'remaining_estimated_hours',
              estimatedVsLogged?.remaining_estimated_hours
            ),
          },
        ]
      : []),
    ...(hasValue(estimatedVsLogged?.unestimated_active_task_count)
      ? [
          {
            label: t('unestimated_tasks'),
            value: toNumber(estimatedVsLogged?.unestimated_active_task_count),
          },
        ]
      : []),
    ...(hasValue(estimatedVsLogged?.active_tasks_over_estimate_count)
      ? [
          {
            label: t('tasks_over_estimate'),
            value: toNumber(
              estimatedVsLogged?.active_tasks_over_estimate_count
            ),
          },
        ]
      : []),
    ...(canViewFinancials
      ? [
          {
            label: t('task_rate'),
            value: formatMoney(
              project.task_rate,
              project.client?.country_id,
              project.client?.settings.currency_id
            ),
          },
        ]
      : []),
    {
      label: t('active_tasks'),
      value: project.tasks?.length ?? 0,
    },
    {
      label: t('total_hours'),
      value: formatter('hours', project.current_hours),
    },
    ...(forecast
      ? [
          {
            label: fieldLabel('average_daily_velocity'),
            value: formatter(
              'average_daily_velocity',
              forecast.average_daily_velocity
            ),
          },
          {
            label: t('remaining_hours'),
            value: formatter('remaining_hours', forecast.remaining_hours),
          },
        ]
      : []),
    {
      label: t('due_date'),
      value: dueDate,
    },
    ...(forecast
      ? [
          {
            label: t('forecast_finish'),
            value: finishDate,
          },
          {
            label: t(scheduleVariance.labelKey),
            value: formatter('schedule_variance_days', scheduleVariance.value),
            valueColor: scheduleVariance.color,
          },
        ]
      : []),
  ];

  return <AnalyticsMetricTable rows={rows} />;
}
