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
import { ProjectForecastCompletion } from '$app/common/interfaces/project-analytics';
import { resolveScheduleVariancePresentation } from '../helpers';
import { useAnalyticsFieldLabel } from '../hooks/useAnalyticsFieldLabel';
import { AnalyticsValueFormatter } from './AnalyticsChartTooltip';
import { AnalyticsMetricTable } from './AnalyticsMetricTable';

interface Props {
  project: Project;
  forecast?: ProjectForecastCompletion;
  formatter: AnalyticsValueFormatter;
  canViewFinancials: boolean;
}

export function ForecastSummary({
  project,
  forecast,
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
