/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';
import { useSelector } from 'react-redux';
import CommonProps from '../../common/interfaces/common-props.interface';
import { RootState } from '../../common/stores/store';

interface Props extends CommonProps {
  label?: string;
}

export function Checkbox(props: Props) {
  const colors = useSelector((state: RootState) => state.settings.colors);

  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={props.innerRef}
          value={props.value}
          id={props.id}
          aria-describedby="comments-description"
          type="checkbox"
          className={`focus:ring-gray-300 h-4 w-4 border-gray-300 rounded dark:bg-gray-700 dark:border-transparent ${props.className}`}
          style={{ color: colors.primary }}
          onChange={props.onChange}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={props.id} className="font-medium text-gray-700">
          {props.label}
        </label>
      </div>
    </div>
  );
}
