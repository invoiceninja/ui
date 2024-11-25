/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { CSSProperties, ReactNode } from 'react';

interface Props {
  variant: 'orange' | 'red';
  children: ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

export function Banner({ variant, children, className, id, style }: Props) {
  return (
    <div
      id={id}
      className={classNames(
        'flex justify-center items-center px-3 py-2 text-xs md:px-6 md:text-sm leading-6 text-gray-900',
        {
          'bg-orange-300': variant === 'orange',
          'bg-red-300': variant === 'red',
        },
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
