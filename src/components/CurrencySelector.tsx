/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrencies } from '$app/common/hooks/useCurrencies';
import { GenericSelectorProps } from './CountrySelector';
import { SearchableSelect } from './SearchableSelect';

interface AdditionalCurrency {
  id: string;
  label: string;
}

interface CurrencySelectorProps extends GenericSelectorProps {
  additionalCurrencies?: AdditionalCurrency[];
}

export function CurrencySelector(props: CurrencySelectorProps) {
  const currencies = useCurrencies();

  const { additionalCurrencies = [] } = props;

  return (
    <SearchableSelect
      value={props.value}
      onValueChange={props.onChange}
      label={props.label}
      errorMessage={props.errorMessage}
      dismissable={props.dismissable}
    >
      {additionalCurrencies.map((currency, index) => (
        <option key={index} value={currency.id}>
          {currency.label}
        </option>
      ))}

      {currencies.map((currency, index) => (
        <option key={index} value={currency.id}>
          {currency.name} ({currency.code})
        </option>
      ))}
    </SearchableSelect>
  );
}
