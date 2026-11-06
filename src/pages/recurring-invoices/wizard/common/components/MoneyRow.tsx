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

interface Props {
  label: string;
  value: string | number;
  strong?: boolean;
}

export function MoneyRow({ label, value, strong }: Props) {
  const colors = useColorScheme();

  return (
    <div className="flex items-baseline justify-between gap-4">
      <span
        className="text-sm"
        style={{
          color: strong ? colors.$3 : colors.$17,
          fontWeight: strong ? 500 : 400,
        }}
      >
        {label}
      </span>

      <span
        className={strong ? 'text-lg' : 'text-sm'}
        style={{
          color: colors.$3,
          fontWeight: strong ? 600 : 400,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}
