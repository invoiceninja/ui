/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { ProjectHealth } from '$app/common/interfaces/project-analytics';
import { Badge, BadgeVariant } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';
import {
  hasValue,
  ratioBarWidth,
  resolveProjectHealthIndicatorRows,
  resolveProjectHealthScore,
  resolveProjectHealthStatus,
} from '../helpers';
import { useAnalyticsFieldLabel } from '../hooks/useAnalyticsFieldLabel';
import { AnalyticsValueFormatter } from './AnalyticsChartTooltip';
import { AnalyticsEmptyState } from './AnalyticsEmptyState';

interface Props {
  health?: ProjectHealth;
  formatter: AnalyticsValueFormatter;
}

export function ProjectHealthHeader({ health, formatter }: Props) {
  const colors = useColorScheme();

  if (!health) {
    return null;
  }

  const score = resolveProjectHealthScore(health);
  const status = resolveProjectHealthStatus(health);

  return (
    <div className="flex items-center gap-3">
      {hasValue(score) && (
        <span className="text-sm font-semibold" style={{ color: colors.$3 }}>
          {formatter('score', score)}
        </span>
      )}

      {status && <Badge variant={status as BadgeVariant}>{status}</Badge>}
    </div>
  );
}

export function ProjectHealthSummary({ health, formatter }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const fieldLabel = useAnalyticsFieldLabel();

  if (!health) {
    return (
      <AnalyticsEmptyState>{t('no_project_health_data')}</AnalyticsEmptyState>
    );
  }

  const indicatorRows = resolveProjectHealthIndicatorRows(health);

  if (!indicatorRows.length) {
    return (
      <AnalyticsEmptyState>
        {t('no_project_health_indicators')}
      </AnalyticsEmptyState>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      {indicatorRows.map((row, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span style={{ color: colors.$22 }}>{fieldLabel(row.key)}</span>

            <span className="font-medium">{formatter(row.key, row.value)}</span>
          </div>

          {(row.showBar || row.showStrip) && (
            <div
              className="h-2 rounded-full"
              style={{ backgroundColor: colors.$20 }}
            >
              <div
                className="h-2 rounded-full"
                style={{
                  backgroundColor: row.color,
                  width: row.showStrip
                    ? '100%'
                    : `${ratioBarWidth(row.value)}%`,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
