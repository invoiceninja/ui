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
import { ReactNode } from 'react';

interface Props {
  variant: 'orange';
  children: ReactNode;
}

export function Banner({ variant, children }: Props) {
  return (
    <div
      className={classNames(
        'flex justify-center items-center px-3 py-2 text-xs md:px-6 md:text-sm leading-6 text-gray-900',
        {
          'bg-orange-300': variant === 'orange',
        }
      )}
    >
      {children}
    </div>
  );
}
