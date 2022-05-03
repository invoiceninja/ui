/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useState } from 'react';
import classNames from 'classnames';
import CommonProps from '../../common/interfaces/common-props.interface';
import { ChevronDown, ChevronUp } from 'react-feather';

export interface ColumnSortPayload {
  sort: string;
  field: string;
}

interface Props extends CommonProps {
  onColumnClick?: any;
  isCurrentlyUsed?: boolean;
}

const defaultProps: Props = {
  isCurrentlyUsed: false,
};

export function Th(props: Props) {
  props = { ...defaultProps, ...props };

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  function handleClick() {
    if (!props.onColumnClick) {
      return;
    }

    order === 'desc' ? setOrder('asc') : setOrder('desc');

    props.onColumnClick({
      sort: `${props.id}|${order}`,
      field: props.id,
    });
  }

  return (
    <th
      onClick={handleClick}
      className={classNames(
        `px-2 lg:px-2.5 xl:px-4 py-2.5 text-left text-xs font-medium text-white uppercase tracking-wider ${props.className}`,
        {
          'cursor-pointer': props.onColumnClick,
        }
      )}
    >
      <div className="flex items-center space-x-1">
        <span>{props.children}</span>

        {props.onColumnClick && (
          <div className="flex items-center">
            <ChevronUp
              className={classNames('opacity-25', {
                'opacity-100': order === 'asc' && props.isCurrentlyUsed,
              })}
              size={16}
            />
            <ChevronDown
              className={classNames('opacity-25', {
                'opacity-100': order === 'desc' && props.isCurrentlyUsed,
              })}
              size={16}
            />
          </div>
        )}
      </div>
    </th>
  );
}
