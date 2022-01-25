/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { classNames } from '../../common/helpers';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useAccentColor } from 'common/hooks/useAccentColor';
import { useEffect } from 'react';

interface Props extends CommonProps {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => any;
}

export default function Toggle(props: Props) {
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setChecked(props.checked as boolean);
    setDisabled(props.disabled as boolean);
  }, [props.checked, props.disabled]);

  const accentColor = useAccentColor();

  const styles: React.CSSProperties = {
    backgroundColor: 'rgb(229 231 235)',
  };

  if (checked) {
    styles.backgroundColor = accentColor;
  }

  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        disabled={disabled}
        checked={checked}
        onChange={(value) => {
          setChecked(value);
          props.onChange && props.onChange(value);
        }}
        style={styles}
        className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        <span
          aria-hidden="true"
          className={classNames(
            checked ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition ease-in-out duration-200'
          )}
        />
      </Switch>
      {props.label && (
        <Switch.Label as="span" className="ml-3">
          <span className="text-sm text-gray-900">{props.label}</span>
        </Switch.Label>
      )}
    </Switch.Group>
  );
}
