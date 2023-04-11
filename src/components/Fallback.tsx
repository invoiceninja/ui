/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Spinner } from '$app/components/Spinner';
import { Default } from '$app/components/layouts/Default';
import { Suspense } from 'react';

interface Props {
  children: JSX.Element;
}

export function Fallback({ children }: Props) {
  return (
    <Suspense
      fallback={
        <Default>
          <Spinner />
        </Default>
      }
    >
      {children}
    </Suspense>
  );
}
