/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function Inline(props: Props) {
  return (
    <div className="inline-flex items-center space-x-2">{props.children}</div>
  );
}
