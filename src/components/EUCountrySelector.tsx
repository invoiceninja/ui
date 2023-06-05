/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectField } from './forms';
import { GenericSelectorProps } from './CountrySelector';
import { euCountries } from '$app/common/constants/eu-countries';

export function EUCountrySelector(props: GenericSelectorProps) {
  return (
    <SelectField
      value={props.value}
      onValueChange={props.onChange}
      label={props.label}
      withBlank
    >
      {Object.entries(euCountries).map((state, index) => (
        <option key={index} value={state[0]}>
          {state[1]}
        </option>
      ))}
    </SelectField>
  );
}
