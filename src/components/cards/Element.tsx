/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import React, { ReactNode } from 'react';

export function Element(props: {
  leftSide?: ReactNode;
  leftSideHelp?: ReactNode;
  pushContentToRight?: boolean;
  children: ReactNode;
  className?: any;
}) {
  return (
    <div
      className={`py-4 px-5 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-10 sm:px-6 flex flex-col lg:flex-row lg:items-center ${props.className}`}
    >
      <dt className="text-sm text-gray-500 flex flex-col">
        <span className="text-gray-500 font-medium ">{props.leftSide}</span>
        {props.leftSideHelp && (
          <span className="text-gray-400 mt-2 text-xs">
            {props.leftSideHelp}
          </span>
        )}
      </dt>
      <dd
        className={classNames(
          'mt-4 text-sm text-gray-900 sm:mt-0 sm:col-span-2',
          {
            'flex flex-col sm:flex-row sm:justify-end':
              props.pushContentToRight,
          }
        )}
      >
        {props.children}
      </dd>
    </div>
  );
}
