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
import { InputLabel } from './InputLabel';
import React from 'react';

interface Props extends CommonProps {
  label?: string | null;
  checked?: boolean;
  onValueChange?: (value: string, checked?: boolean) => unknown;
  cypressRef?: string;
}

const Input = styled.input`
  background-color: ${(props) => props.theme.backgroundColor};
  border-color: ${(props) => props.theme.borderColor};

  &:checked {
    background-color: #000000 !important;
    border-color: ${(props) => props.theme.checkedBorderColor} !important;
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }
`;

const getCheckmarkSvgUrl = (color: string): string => {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="0.4rem" height="0.4rem" viewBox="0 0 12 12"><path d="m4.21,10.329h-.011c-.289-.004-.549-.174-.67-.436-.622-1.35-1.334-2.387-2.31-3.363-.293-.293-.293-.768,0-1.061.293-.293.768-.293,1.061,0,.772.773,1.398,1.577,1.943,2.508,1.4-2.384,3.272-4.451,5.58-6.16.333-.246.802-.177,1.049.157.246.333.176.803-.157,1.049-2.516,1.861-4.471,4.179-5.814,6.888-.126.256-.387.417-.672.417Z" strokeWidth="1" fill="${color}"></path></svg>`;

  const encodedSvg = encodeURIComponent(svgContent);
  return `url("data:image/svg+xml,${encodedSvg}")`;
};

export function Checkbox$(props: Props) {
  const colors = useColorScheme();

  const checkmarkDataUrl = getCheckmarkSvgUrl(colors.$9);

  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <Input
          ref={props.innerRef}
          value={props.value}
          id={props.id}
          aria-describedby="comments-description"
          type="checkbox"
          className={classNames(
            'rounded border cursor-pointer disabled:opacity-50',
            props.className
          )}
          style={{
            backgroundImage: props.checked ? checkmarkDataUrl : 'none',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '85%',
            width: '1.1rem',
            height: '1.1rem',
          }}
          theme={{
            backgroundColor: colors.$1,
            checkedBorderColor: colors.$3,
            borderColor: colors.$5,
          }}
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

      {props.label && (
        <div className="ml-3 text-sm">
          <InputLabel>{props.label}</InputLabel>
        </div>
      )}
    </div>
  );
}

export const Checkbox = React.memo(Checkbox$);
