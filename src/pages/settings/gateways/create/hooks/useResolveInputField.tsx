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
import { useAccentColor } from 'common/hooks/useAccentColor';
import { CompanyGateway } from 'common/interfaces/company-gateway';
import Toggle from 'components/forms/Toggle';
import { ChangeEvent } from 'react';
import { useHandleCredentialsChange } from './useHandleCredentialsChange';

export type Field = '' | boolean | Array<string>;

export function useResolveInputField(
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >
) {
  const handleChange = useHandleCredentialsChange(setCompanyGateway);
  const accentColor = useAccentColor();

  // Possible types:

  // Input field, where value is ""
  // Boolean (toggle) where value is false/true (default)
  // Dropdow where value is array of possible items

  return (property: string, value: Field) => {
    if (property.toLowerCase().endsWith('color')) {
      return (
        <input
          type="color"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleChange(property as keyof Field, event.target.value)
          }
          defaultValue={accentColor}
        />
      );
    }

    if (property === 'appleDomainVerification') {
      return (
        <InputField
          element="textarea"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleChange(property as keyof Field, event.target.value)
          }
        />
      );
    }

    if (typeof value === 'string') {
      return (
        <InputField
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleChange(property as keyof Field, event.target.value)
          }
        />
      );
    }

    if (typeof value === 'boolean') {
      return (
        <Toggle
          checked={value}
          onChange={(value) => handleChange(property as keyof Field, value)}
        />
      );
    }

    if (typeof value === 'object') {
      return (
        <SelectField
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleChange(property as keyof Field, event.target.value)
          }
        >
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
