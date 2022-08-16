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
  title: string;
  value?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function InfoCard(props: Props) {
  return (
    <div
      className={`px-4 py-5 bg-white shadow rounded overflow-hidden sm:p-6 space-y-2 ${props.className}`}
    >
      <dd className="text-xl font-medium text-gray-900">{props.title}</dd>
      <dt className="text-sm text-gray-500 truncate">
        {props.value} {props.children}
      </dt>
    </div>
  );
}
