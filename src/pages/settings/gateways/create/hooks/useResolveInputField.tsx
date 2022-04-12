/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InputField, SelectField } from '@invoiceninja/forms';
import Toggle from 'components/forms/Toggle';

export type Field = '' | boolean | Array<string>;

export function useResolveInputField() {
  // Possible types:

  // Input field, where value is ""
  // Boolean (toggle) where value is false/true (default)
  // Dropdow where value is array of possible items

  return (property: string, value: Field) => {
    if (typeof value === 'string') {
      return <InputField />;
    }

    if (typeof value === 'boolean') {
      return <Toggle checked={value} />;
    }

    if (typeof value === 'object') {
      return (
        <SelectField>
          {value.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
      );
    }

    console.log(value);
  };
}
