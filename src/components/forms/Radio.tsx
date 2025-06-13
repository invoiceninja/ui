/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ChangeEvent } from 'react';
import CommonProps from '../../common/interfaces/common-props.interface';
import classNames from 'classnames';
import { useColorScheme } from '$app/common/colors';

interface Props extends CommonProps {
  options: {
    id: string;
    title: string;
    value: string | number | readonly string[] | undefined;
  }[];
  defaultSelected?: string;
  name: string;
  onValueChange?: (value: string) => unknown;
}

export function Radio(props: Props) {
  const colors = useColorScheme();

  return (
    <fieldset>
      <legend className="sr-only">Notification method</legend>
      <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
        {props.options.map((option) => (
          <div
            key={option.id}
            className="flex items-center"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              props.onValueChange?.(event.target.value)
            }
          >
            <input
              value={option.value}
              onClick={props.onClick}
              onChange={() => {}}
              disabled={props.disabled}
              id={option.id}
              name={props.name}
              type="radio"
              checked={option.value === props.defaultSelected}
              className="focus:ring-0 h-4 w-4 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              style={{ color: colors.$3 }}
            />
            <label
              htmlFor={option.id}
              className={classNames('ml-3 block text-sm font-medium', {
                'opacity-75 cursor-not-allowed': props.disabled,
                'cursor-pointer':
                  typeof props.disabled === 'undefined' || !props.disabled,
              })}
            >
              {option.title}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
