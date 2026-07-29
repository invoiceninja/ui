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
import {
  AnalyticsChartDatum,
  cleanTooltipText,
  formatRatioPercent,
  toFiniteNumber,
  toNumber,
} from '../helpers';
import { useAnalyticsFieldLabel } from '../hooks/useAnalyticsFieldLabel';

export type AnalyticsValueFormatter = (
  dataKey: string,
  value: unknown
) => string;

export interface AnalyticsTooltipOptions {
  labelKey?: string;
  nameKey?: string;
  percentTotal?: number;
  showPercent?: boolean;
}

interface PayloadItem {
  color?: string;
  dataKey?: string | number;
  fill?: string;
  name?: string | number;
  payload?: AnalyticsChartDatum;
  percent?: unknown;
  value?: unknown;
}

interface Props {
  formatter: AnalyticsValueFormatter;
  options?: AnalyticsTooltipOptions;
  active?: boolean;
  label?: string | number;
  payload?: PayloadItem[];
}

const readPayloadValue = (item: PayloadItem, key: string) => {
  return item.payload?.[key];
};

const resolvePercent = (item: PayloadItem, total: number | undefined) => {
  const payloadPercent = toFiniteNumber(item.percent);

  if (payloadPercent !== null) {
    return payloadPercent;
  }

  if (!total) {
    return null;
  }

  return toNumber(item.value) / total;
};

export function AnalyticsChartTooltip({
  formatter,
  options,
  active,
  label,
  payload,
}: Props) {
  const colors = useColorScheme();
  const fieldLabel = useAnalyticsFieldLabel();

  if (!active || !payload || !payload.length) {
    return null;
  }

  const labelFromPayload = options?.labelKey
    ? readPayloadValue(payload[0], options.labelKey)
    : undefined;

  const displayLabel =
    cleanTooltipText(labelFromPayload) || cleanTooltipText(label);

  return (
    <div
      className="rounded-md border p-3 text-sm shadow-lg"
      style={{
        backgroundColor: colors.$1,
        borderColor: colors.$24,
        color: colors.$3,
      }}
    >
      {displayLabel && (
        <div className="mb-2 font-medium" style={{ color: colors.$3 }}>
          {displayLabel}
        </div>
      )}

      <div className="space-y-1">
        {payload.map((item, index) => {
          const dataKey = String(item.dataKey ?? item.name ?? index);
          const percent = options?.showPercent
            ? resolvePercent(item, options.percentTotal)
            : null;

          const nameFromPayload = options?.nameKey
            ? readPayloadValue(item, options.nameKey)
            : undefined;

          const itemLabel =
            cleanTooltipText(nameFromPayload) ||
            cleanTooltipText(item.name) ||
            fieldLabel(dataKey);

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-6"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                  style={{
                    backgroundColor: item.color || item.fill || colors.$22,
                  }}
                />

                <span className="truncate">{itemLabel}</span>
              </div>

              <span className="whitespace-nowrap font-medium">
                {formatter(dataKey, item.value)}

                {percent !== null && (
                  <span style={{ color: colors.$22 }}>
                    {' '}
                    ({formatRatioPercent(percent)})
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
