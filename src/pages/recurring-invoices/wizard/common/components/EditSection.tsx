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
  children: ReactNode;
  last?: boolean;
}

export function EditSection({ label, children, last }: Props) {
  const colors = useColorScheme();

  return (
    <section
      className={last ? '' : 'pb-6 mb-6'}
      style={last ? undefined : { borderBottom: `1px dashed ${colors.$5}` }}
    >
      <h4
        className="text-sm mb-3"
        style={{ color: colors.$22, fontWeight: 500 }}
      >
        {label}
      </h4>

      {children}
    </section>
  );
}
