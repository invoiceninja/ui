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

export function Legend({ children }: Props) {
  const colors = useColorScheme();

  return (
    <div
      className="text-sm mb-2"
      style={{ color: colors.$22, fontWeight: 500 }}
    >
      {children}
    </div>
  );
}
