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
import { Breadcrumbs, Page } from './Breadcrumbs';

export interface ContainerProps {
  breadcrumbs: Page[];
  children: ReactNode;
  className?: string;
}

export function Container(props: ContainerProps) {
  return (
    <div className="flex justify-center">
      <Breadcrumbs pages={props.breadcrumbs} />

      <div className={`container max-w-3xl space-y-6 ${props.className}`}>
        {props.children}
      </div>
    </div>
  );
}
