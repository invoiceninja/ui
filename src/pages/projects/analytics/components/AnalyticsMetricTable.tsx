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
import { ReactNode } from 'react';

interface Props {
  rows: { label: string; value: ReactNode }[];
}

export function AnalyticsMetricTable({ rows }: Props) {
  const colors = useColorScheme();

  return (
    <div className="divide-y text-sm" style={{ borderColor: colors.$20 }}>
      {rows.map((row, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 py-3"
          style={{ borderColor: colors.$20 }}
        >
          <span style={{ color: colors.$22 }}>{row.label}</span>

          <span className="text-right font-medium">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
