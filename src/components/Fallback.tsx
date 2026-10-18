/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Suspense } from 'react';
import { LazyDefault as Default } from '$app/components/layouts/LazyDefault';
import { Spinner } from '$app/components/Spinner';

interface Props {
  children: JSX.Element;
  type?: 'page' | 'component' | 'subPage';
}

export function Fallback({ children, type = 'page' }: Props) {
  return (
    <Suspense
      fallback={
        type === 'page' || type === 'component' ? (
          <Suspense fallback={<Spinner />}>
            <Default breadcrumbs={[]}>
              <Spinner />
            </Default>
          </Suspense>
        ) : (
          <Spinner />
        )
      }
    >
      {children}
    </Suspense>
  );
}
