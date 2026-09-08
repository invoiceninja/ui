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
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  accent: string;
}

export function AnalyticsStatCard({ label, value, detail, accent }: Props) {
  const colors = useColorScheme();

  return (
    <div
      className="rounded-md border p-3"
      style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium" style={{ color: colors.$22 }}>
          {label}
        </span>

        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </div>

      <div className="mt-2 truncate text-lg font-semibold">{value}</div>

      {detail && (
        <div className="mt-1 truncate text-xs" style={{ color: colors.$22 }}>
          {detail}
        </div>
      )}
    </div>
  );
}
