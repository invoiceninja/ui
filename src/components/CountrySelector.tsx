/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCountries } from 'common/hooks/useCountries';
import { SelectField } from './forms';

interface Props {
  value: string;
  onChange: (id: string) => unknown;
}

export function CountrySelector(props: Props) {
  const countries = useCountries();

  return (
    <SelectField onValueChange={props.onChange} withBlank>
      {countries.map((country, index) => (
        <option key={index} value={country.id}>
          {country.name}
        </option>
      ))}
    </SelectField>
  );
}
