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
  back?: ReactNode;
  children: ReactNode;
}

export function StepFooter({ back, children }: Props) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">{back}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
