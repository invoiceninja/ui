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
  type?: 'page' | 'component' | 'subPage';
}

export function Fallback({ children, type = 'page' }: Props) {
  return (
    <Suspense
      fallback={
        type === 'page' || type === 'component' ? (
          <Default>
            <Spinner />
          </Default>
        ) : (
          <Spinner />
        )
      }
    >
      {children}
    </Suspense>
  );
}
