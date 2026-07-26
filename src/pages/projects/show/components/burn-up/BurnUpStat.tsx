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
}

export function BurnUpStat({ label, value, detail }: Props) {
  const colors = useColorScheme();

  return (
    <div
      className="flex flex-col rounded-md border px-3 py-2"
      style={{ borderColor: colors.$24, backgroundColor: colors.$2 }}
    >
      <span className="text-xs font-medium" style={{ color: colors.$17 }}>
        {label}
      </span>

      <span className="text-lg font-semibold" style={{ color: colors.$3 }}>
        {value}
      </span>

      {detail && (
        <span className="text-xs" style={{ color: colors.$17 }}>
          {detail}
        </span>
      )}
    </div>
  );
}
