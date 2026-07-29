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
import { ProjectForecastCompletion } from '$app/common/interfaces/project-analytics';
import { useTranslation } from 'react-i18next';
import { useAnalyticsFieldLabel } from '../hooks/useAnalyticsFieldLabel';
import { AnalyticsValueFormatter } from './AnalyticsChartTooltip';
import { AnalyticsEmptyState } from './AnalyticsEmptyState';
import { AnalyticsMetricTable } from './AnalyticsMetricTable';

interface Props {
  forecast?: ProjectForecastCompletion;
  formatter: AnalyticsValueFormatter;
}

export function ForecastSummary({ forecast, formatter }: Props) {
  const [t] = useTranslation();

  const fieldLabel = useAnalyticsFieldLabel();
  const { dateFormat } = useCurrentCompanyDateFormats();

  if (!forecast) {
    return <AnalyticsEmptyState>{t('no_forecast_data')}</AnalyticsEmptyState>;
  }

  const finishDate = forecast.forecast_finish_date
    ? formatDate(forecast.forecast_finish_date, dateFormat)
    : '-';

  const rows = [
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
    {
      label: t('forecast_finish'),
      value: finishDate,
    },
    {
      label: fieldLabel('schedule_variance_days'),
      value: formatter(
        'schedule_variance_days',
        forecast.schedule_variance_days
      ),
    },
  ];

  return <AnalyticsMetricTable rows={rows} />;
}
