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
import { useTranslation } from 'react-i18next';
import { BurnUpPoint } from './burn-up';
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

  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  const formatHours = (value: number): string => {
    return formatNumber(Number(value.toFixed(1))).toString();
  };

  const formatPercent = (value: number): string => {
    return `${formatNumber(Math.round(value))}%`;
  };

  const rows: TooltipRow[] = [
    {
      label: t('completed'),
      value: point.completed !== null ? formatPercent(point.completed) : '—',
      color: BURN_UP_COMPLETED_COLOR,
    },
  ];

  if (point.target !== null) {
    rows.push({
      label: t('target'),
      value: formatPercent(point.target),
      color: BURN_UP_TARGET_COLOR,
    });
  }

  if (point.loggedHours !== null) {
    rows.push({
      label: t('logged'),
      value: `${formatHours(point.loggedHours)} / ${formatHours(scopeHours)}`,
    });
  }

  const delta =
    point.completed !== null && point.target !== null
      ? point.completed - point.target
      : null;

  return (
    <div
      className="p-3 shadow-lg rounded-md border text-sm"
      style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
    >
      <p className="font-semibold mb-2">{formatDate(point.date, dateFormat)}</p>

      {rows.map((row) => (
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

      {delta !== null && (
        <p
          className="mt-2 pt-2 border-t text-xs"
          style={{ borderColor: colors.$20, color: colors.$17 }}
        >
          {delta >= 0
            ? `${t('ahead_of_schedule')} ${formatPercent(Math.abs(delta))}`
            : `${t('behind_schedule')} ${formatPercent(Math.abs(delta))}`}
        </p>
      )}
    </div>
  );
}
