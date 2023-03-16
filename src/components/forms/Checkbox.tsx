/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from '$app/common/hooks/useAccentColor';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  label?: string | null;
  checked?: boolean;
  onValueChange?: (value: string, checked?: boolean) => unknown;
  cypressRef?: string;
}

export function Checkbox(props: Props) {
  const accentColor = useAccentColor();

  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={props.innerRef}
          value={props.value}
          id={props.id}
          aria-describedby="comments-description"
          type="checkbox"
          className={`focus:ring-gray-300 h-4 w-4 border-gray-300 rounded dark:bg-gray-700 dark:border-transparent cursor-pointer disabled:opacity-50 ${props.className}`}
          style={{ color: accentColor }}
          onChange={(event) => {
            props.onChange && props.onChange(event);
            props.onValueChange &&
              props.onValueChange(event.target.value, event.target.checked);
          }}
          checked={props.checked}
          disabled={props.disabled}
          data-cy={props.cypressRef}
        />
      </div>
      <div className="ml-3 text-sm">
        <label
          htmlFor={props.id}
          className="font-medium text-gray-700 cursor-pointer"
        >
          {props.label}
        </label>
      </div>
    </div>
  );
}
