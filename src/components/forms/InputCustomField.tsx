/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AvailableTypes } from 'pages/settings/custom-fields/components';
import { ChangeEvent, useEffect, useState } from 'react';
import { InputField, SelectField } from '.';
import Toggle from './Toggle';

export interface Props {
  defaultValue: any;
  field: string;
  value: string;
  onChange: (value: string | number | boolean) => unknown;
}

export function InputCustomField(props: Props) {
  const [type, setType] = useState('single_line_text');

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [fieldLabel, fieldType] = props.value.includes('|')
      ? props.value.split('|')
      : [props.value, 'multi_line_text'];

    setType(fieldType);
  }, []);

  return (
    <>
      {type === AvailableTypes.SingleLineText && (
        <InputField
          type="text"
          id={props.field}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            props.onChange(event.target.value)
          }
          value={props.defaultValue || ''}
        />
      )}

      {type === AvailableTypes.MultiLineText && (
        <InputField
          element="textarea"
          id={props.field}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            props.onChange(event.target.value)
          }
          value={props.defaultValue || ''}
        />
      )}

      {type === AvailableTypes.Switch && (
        <Toggle onChange={props.onChange} checked={props.defaultValue} />
      )}

      {type === AvailableTypes.Date && (
        <InputField
          type="date"
          id={props.field}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            props.onChange(event.target.value)
          }
          value={props.defaultValue || ''}
        />
      )}

      {!Object.values(AvailableTypes).includes(type as AvailableTypes) && (
        <SelectField
          defaultValue={props.defaultValue || ''}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            props.onChange(event.target.value)
          }
        >
          <option value=""></option>
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
