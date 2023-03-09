/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InputField, SelectField } from '$app/components/forms';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import Toggle from '$app/components/forms/Toggle';
import { ChangeEvent } from 'react';
import { useHandleCredentialsChange } from './useHandleCredentialsChange';
import { useResolveConfigValue } from './useResolveConfigValue';

export type Field = '' | boolean | Array<string>;

export function useResolveInputField(
  companyGateway: CompanyGateway,
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >
) {
  const resolveConfigValue = useResolveConfigValue(companyGateway);
  const handleChange = useHandleCredentialsChange(setCompanyGateway);
  const accentColor = useAccentColor();

  // Possible types:

  // Input field, where value is ""
  // Boolean (toggle) where value is false/true (default)
  // Dropdow where value is array of possible items

  return (
    property: string,
    value: Field,
    errors: ValidationBag | undefined
  ) => {
    if (property.toLowerCase().endsWith('color')) {
      return (
        <ColorPicker
          value={resolveConfigValue(property) || accentColor}
          onValueChange={(color) =>
            handleChange(property as keyof Field, color)
          }
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
          value={resolveConfigValue(property)}
          errorMessage={errors?.errors.appleDomainVerification}
        />
      );
    }

    if (typeof value === 'string') {
      const isSecureField =
        property.toLowerCase().includes('key') ||
        property.toLowerCase().includes('password') ||
        property.toLowerCase().includes('secret') ||
        property.toLowerCase().includes('id');

      return (
        <InputField
          type={isSecureField ? 'password' : 'text'}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleChange(property as keyof Field, event.target.value)
          }
          value={resolveConfigValue(property)}
          errorMessage={errors?.errors[property]}
        />
      );
    }

    if (typeof value === 'boolean') {
      return (
        <Toggle
          checked={resolveConfigValue(property)}
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
          value={resolveConfigValue(property)}
          errorMessage={errors?.errors[property]}
        >
          {value.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
      );
    }
  };
}
