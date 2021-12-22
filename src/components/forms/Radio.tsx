/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DetailedHTMLProps, InputHTMLAttributes } from 'react';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  options: {
    id: string;
    title: string;
    value: string | number | readonly string[] | undefined;
  }[];
  defaultSelected?: string;
  name: string;
}

export function Radio(props: Props) {
  return (
    <fieldset className="mt-4">
      <legend className="sr-only">Notification method</legend>
      <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
        {props.options.map((option) => (
          <div key={option.id} className="flex items-center">
            <input
              value={option.value}
              onClick={props.onClick}
              onChange={() => {}}
              id={option.id}
              name={props.name}
              type="radio"
              checked={option.value === props.defaultSelected}
              className="focus:ring-gray-500 h-4 w-4 text-gray-800 border-gray-300"
            />
            <label
              htmlFor={option.id}
              className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
            >
              {option.title}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
