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
import { Currency } from '$app/common/interfaces/currency';
import { GenericSelectorProps } from './CountrySelector';
import { ComboboxStatic, Entry, emptyComboboxEntry } from './forms/Combobox';

export function CurrencySelector(props: GenericSelectorProps) {
  const currencies = useCurrencies();

  const entries: Entry<Currency>[] = currencies.map((c) => ({
    id: c.id,
    label: c.name,
    value: c.id,
    resource: c,
    eventType: 'external',
    searchable: `${c.name} (${c.code})`,
  }));

  return (
    <ComboboxStatic<Currency>
      inputOptions={{
        value: props.value.toString(),
        label: props.label ?? '',
      }}
      entries={[emptyComboboxEntry, ...entries]}
      entryOptions={{
        id: 'id',
        label: 'name',
        value: 'id',
        dropdownLabelFn: (c) => `${c.name} (${c.code})`,
      }}
      onChange={(entry) => props.onChange(entry.id.toString())}
    />
  );
}
