/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AvailableTypes } from '$app/pages/settings/custom-fields/components';
import { useEffect, useState } from 'react';
import { InputField, SelectField } from '.';
import Toggle from './Toggle';
import { useColorScheme } from '$app/common/colors';

export interface Props {
  defaultValue: any;
  field: string;
  value: string;
  onValueChange: (value: string | number | boolean) => unknown;
  selectMenuPosition?: 'fixed';
}

export function InputCustomField(props: Props) {
  const [type, setType] = useState('single_line_text');
  const colors = useColorScheme();

  useEffect(() => {
    const [, fieldType] = props.value.includes('|')
      ? props.value.split('|')
      : [props.value, 'multi_line_text'];

    setType(fieldType);
  }, [props.field]);

  return (
    <>
      {type === AvailableTypes.SingleLineText && (
        <InputField
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          type="text"
          id={props.field}
          onValueChange={props.onValueChange}
          value={props.defaultValue || ''}
        />
      )}

      {type === AvailableTypes.MultiLineText && (
        <InputField
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          element="textarea"
          id={props.field}
          onValueChange={props.onValueChange}
          value={props.defaultValue || ''}
        />
      )}

      {type === AvailableTypes.Switch && (
        <Toggle
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          onChange={(value) => {
            const e = Boolean(value) === true ? 'yes' : 'no';
            props.onValueChange(e);
          }}
          checked={
            typeof props.defaultValue === 'string'
              ? props.defaultValue === 'true' ||
                props.defaultValue === '1' ||
                props.defaultValue === 'yes'
              : props.defaultValue
          }
        />
      )}

      {type === AvailableTypes.Date && (
        <InputField
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          type="date"
          id={props.field}
          onValueChange={props.onValueChange}
          value={props.defaultValue || ''}
        />
      )}

      {!Object.values(AvailableTypes).includes(type as AvailableTypes) && (
        <SelectField
          value={props.defaultValue || ''}
          onValueChange={(currentValue) => props.onValueChange(currentValue)}
          customSelector
          withBlank
          menuPosition={props.selectMenuPosition}
        >
          {type.split(',').map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
      )}
    </>
  );
}
