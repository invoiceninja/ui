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
import classNames from 'classnames';
import { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SimplifiedCard({ title, children, className }: Props) {
  const colors = useColorScheme();

  return (
    <div
      className={classNames(
        'border rounded-md flex flex-col self-start w-full',
        className
      )}
      style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
    >
      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: colors.$24 }}
      >
        <span className="text-sm font-semibold" style={{ color: colors.$3 }}>
          {title}
        </span>
      </div>

      <div className="px-6 py-4 flex flex-col gap-y-4">{children}</div>
    </div>
  );
}
