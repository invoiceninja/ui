/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { styled } from 'styled-components';
import CommonProps from '../../common/interfaces/common-props.interface';
import classNames from 'classnames';

interface Props extends CommonProps {
  label?: string | null;
  checked?: boolean;
  onValueChange?: (value: string, checked?: boolean) => unknown;
  cypressRef?: string;
}

const Input = styled.input`
  background-color: ${(props) => props.theme.backgroundColor};
`;

export function Checkbox(props: Props) {
  const colors = useColorScheme();

  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <Input
          theme={{ backgroundColor: colors.$2 }}
          ref={props.innerRef}
          value={props.value}
          id={props.id}
          aria-describedby="comments-description"
          type="checkbox"
          className={classNames(
            'h-4 w-4 rounded cursor-pointer disabled:opacity-50',
            props.className
          )}
          style={{ borderColor: colors.$5 }}
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
          className="font-medium cursor-pointer"
          style={{ color: colors.$3 }}
        >
          {props.label}
        </label>
      </div>
    </div>
  );
}
