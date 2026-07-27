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
import { date as formatDate } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useFormatNumber } from '$app/common/hooks/useFormatNumber';
import { BurnUpPoint } from '$app/pages/projects/show/common/helpers/burn-up';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BURN_UP_COMPLETED_COLOR, BURN_UP_TARGET_COLOR } from './constants';

interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

interface Props {
  scopeHours: number;
  active?: boolean;
  payload?: { payload: BurnUpPoint }[];
}

export function BurnUpTooltip({ scopeHours, active, payload }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const formatNumber = useFormatNumber();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const point = active && payload && payload.length ? payload[0].payload : null;

  const content = useMemo(() => {
    if (!point) {
      return null;
    }

    const formatHours = (value: number) => {
      return formatNumber(Number(value.toFixed(1))).toString();
    };

    const formatPercent = (value: number) => {
      return `${formatNumber(Math.round(value))}%`;
    };

    const formatPercentOrDash = (value: number | null) => {
      if (value === null) {
        return '—';
      }

      return formatPercent(value);
    };

    const buildDeltaLabel = () => {
      if (point.completed === null || point.target === null) {
        return null;
      }

      const delta = point.completed - point.target;
      const direction =
        delta >= 0 ? t('ahead_of_schedule') : t('behind_schedule');

      return `${direction} ${formatPercent(Math.abs(delta))}`;
    };

    const rows = [
      {
        label: t('completed'),
        value: formatPercentOrDash(point.completed),
        color: BURN_UP_COMPLETED_COLOR,
      },
      point.target !== null && {
        label: t('target'),
        value: formatPercent(point.target),
        color: BURN_UP_TARGET_COLOR,
      },
      point.loggedHours !== null && {
        label: t('logged'),
        value: `${formatHours(point.loggedHours)} / ${formatHours(scopeHours)}`,
      },
    ].filter((row): row is TooltipRow => row !== false);

    return {
      dateLabel: formatDate(point.date, dateFormat),
      rows,
      deltaLabel: buildDeltaLabel(),
    };
  }, [point, scopeHours, dateFormat]);

  if (!content) {
    return null;
  }

  return (
    <div
      className="p-3 shadow-lg rounded-md border text-sm"
      style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
    >
      <p className="font-semibold mb-2">{content.dateLabel}</p>

      {content.rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between space-x-8 py-0.5"
        >
          <div className="flex items-center space-x-2">
            {row.color && (
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: row.color }}
              />
            )}

            <span style={{ color: colors.$3 }}>{row.label}</span>
          </div>

          <span className="font-medium font-mono" style={{ color: colors.$3 }}>
            {row.value}
          </span>
        </div>
      ))}

      {content.deltaLabel && (
        <p
          className="mt-2 pt-2 border-t text-xs"
          style={{ borderColor: colors.$20, color: colors.$17 }}
        >
          {content.deltaLabel}
        </p>
      )}
    </div>
  );
}
