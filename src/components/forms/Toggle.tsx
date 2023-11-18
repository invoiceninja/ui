/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { Switch } from '@headlessui/react';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useEffect } from 'react';
import { useColorScheme } from '$app/common/colors';
import { styled } from 'styled-components';
import classNames from 'classnames';

interface Props extends CommonProps {
  label?: string | null;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => unknown;
  onValueChange?: (value: boolean) => unknown;
}

const StyledSwitch = styled(Switch)`
  &:focus {
    outline: 2px solid ${(props) => props.theme.ringColor};
  }
  border-color: ${(props) => props.theme.borderColor};
  background-color: ${(props) => props.theme.backgroundColor};
`;

export default function Toggle(props: Props) {
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setChecked(Boolean(props.checked));
    setDisabled(Boolean(props.disabled));
  }, [props.checked, props.disabled]);

  const accentColor = useAccentColor();
  const colors = useColorScheme();

  return (
    <Switch.Group as="div" className="flex items-center">
      <StyledSwitch
        theme={{
          ringColor: colors.$5,
          borderColor: colors.$5,
          backgroundColor: checked ? accentColor : colors.$5,
        }}
        checked={checked}
        onChange={(value) => {
          if (!disabled) {
            setChecked(value);
            props.onChange && props.onChange(value);
            props.onValueChange && props.onValueChange(value);
          }
        }}
        className={classNames(
          'relative inline-flex items-center border flex-shrink-0 h-6 w-11 rounded-full transition-colors ease-in-out duration-200',
          {
            'border-transparent cursor-not-allowed opacity-75': disabled,
            'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2':
              !disabled,
          }
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            checked ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition ease-in-out duration-200 border'
          )}
          style={{ borderColor: colors.$9 }}
        />
      </StyledSwitch>
      {props.label && (
        <Switch.Label as="span" className="ml-3">
          <span className="text-sm">{props.label}</span>
        </Switch.Label>
      )}
    </Switch.Group>
  );
}
