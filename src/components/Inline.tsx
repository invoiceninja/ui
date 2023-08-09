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
  children: ReactNode;
  className?: string;
}

export function Inline({ children, className }: Props) {
  return (
    <div
      className={classNames('inline-flex items-center space-x-2', className)}
    >
      {children}
    </div>
  );
}
