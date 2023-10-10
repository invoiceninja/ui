/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCountries } from '$app/common/hooks/useCountries';
import { Country } from '$app/common/interfaces/country';
import { ComboboxStatic, Entry, emptyComboboxEntry } from './forms/Combobox';

export interface GenericSelectorProps<T = string> {
  value: T;
  label?: string | null;
  onChange: (id: string) => unknown;
  errorMessage?: string | string[];
}

export function CountrySelector(props: GenericSelectorProps) {
  const countries = useCountries();

  const entries: Entry<Country>[] = countries.map((c) => ({
    id: c.id,
    label: c.name,
    value: c.id,
    resource: c,
    eventType: 'external',
    searchable: `${c.name} (${c.iso_3166_3})`,
  }));

  return (
    <ComboboxStatic<Country>
      inputOptions={{
        value: props.value.toString(),
        label: props.label ?? '',
      }}
      entries={[emptyComboboxEntry, ...entries]}
      entryOptions={{
        id: 'id',
        label: 'name',
        value: 'id',
        dropdownLabelFn: (c) => `${c.name} (${c.iso_3166_3})`,
      }}
      onChange={(entry) => props.onChange(entry.id.toString())}
    />
  );
}
