/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrencies } from 'common/hooks/useCurrencies';
import { GenericSelectorProps } from './CountrySelector';
import { SelectField } from './forms';

export function CurrencySelector(props: GenericSelectorProps) {
  const currencies = useCurrencies();

  return (
    <SelectField value={props.value} onValueChange={props.onChange} withBlank>
      {currencies.map((currency, index) => (
        <option key={index} value={currency.id}>
          {currency.name}
        </option>
      ))}
    </SelectField>
  );
}
