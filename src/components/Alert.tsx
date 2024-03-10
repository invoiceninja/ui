/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useState } from 'react';
import classNames from 'classnames';
import CommonProps from '../common/interfaces/common-props.interface';
import { X } from 'react-feather';
import { useColorScheme } from '$app/common/colors';

interface Props extends CommonProps {
  type?: string | 'success' | 'warning' | 'danger';
  disableClosing?: boolean;
}

export function Alert(props: Props) {
  const [visible, setVisible] = useState<boolean>(true);
  const colors = useColorScheme();

  return (
    <div
      style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1 }}
      className={classNames(`border-l-4 py-2 ${props.className}`, {
        'bg-red-50 border-red-500': props.type === 'danger',
        'bg-yellow-50 border-yellow-500': props.type === 'warning',
        'bg-green-50 border-green-500': props.type === 'success',
        block: visible,
        hidden: !visible,
      })}
    >
      <div className="mx-4">
        <div
          style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}
          className={classNames('text-sm', {
            'text-red-700': props.type === 'danger',
            'text-yellow-700': props.type === 'warning',
            'text-green-700': props.type === 'success',
          })}
        >
          <div className="flex items-center justify-between space-x-2" style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}>
            <div className="w-full" style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}>{props.children}</div>

            {!props.disableClosing && (
              <button type="button">
                <X onClick={() => setVisible(false)} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
