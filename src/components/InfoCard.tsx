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
import { CSSProperties, ReactNode } from 'react';

interface Props {
  title: string;
  value?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function InfoCard(props: Props) {
  const colors = useColorScheme();

  return (
    <div
      className={`border px-4 py-5 shadow rounded overflow-auto sm:p-6 space-y-2 ${props.className}`}
      style={{
        backgroundColor: colors.$1,
        borderColor: colors.$5,
        ...props.style,
      }}
    >
      <dd className="text-xl font-medium">{props.title}</dd>
      <dt className="text-sm truncate">
        {props.value} {props.children}
      </dt>
    </div>
  );
}
