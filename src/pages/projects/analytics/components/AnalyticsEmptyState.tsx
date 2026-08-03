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
  children: ReactNode;
}

export function AnalyticsEmptyState({ children }: Props) {
  const colors = useColorScheme();

  return (
    <div
      className="flex h-full min-h-[160px] items-center justify-center rounded-md border border-dashed px-4 text-center text-sm"
      style={{ borderColor: colors.$24, color: colors.$22 }}
    >
      {children}
    </div>
  );
}
