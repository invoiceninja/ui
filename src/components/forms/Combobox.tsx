/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Combobox as HeadlessCombobox } from '@headlessui/react';
import classNames from 'classnames';
import { useState } from 'react';
import { Check, ChevronDown } from 'react-feather';
import { useTranslation } from 'react-i18next';

interface Entry<T = any> {
  id: number | string;
  label: string;
  value: string | number | boolean;
  resource: T | null;
}

interface ComboboxStaticProps<T = unknown> {
  value: string | number | boolean | null;
  entries: Entry<T>[];
}

export function Combobox({ entries }: ComboboxStaticProps) {
  const [t] = useTranslation();
  const [selectedValue, setSelectedValue] = useState<Entry | null>(null);
  const [query, setQuery] = useState('');

  const filteredValues =
    query === ''
      ? entries
      : entries.filter((entry) => {
          return (
            entry.label.toLowerCase().includes(query.toLowerCase()) ||
            entry.value.toString().toLowerCase().includes(query.toLowerCase())
          );
        });

  return (
    <HeadlessCombobox
      as="div"
      value={selectedValue}
      onChange={setSelectedValue}
      nullable
    >
      <HeadlessCombobox.Label className="text-sm text-gray-500 font-medium block">
        Assigned to
      </HeadlessCombobox.Label>
      <div className="relative mt-2">
        <HeadlessCombobox.Input
          className="w-full rounded border-0 bg-white py-2 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(entry: Entry) => entry?.label}
        />
        <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </HeadlessCombobox.Button>

        <HeadlessCombobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredValues.length > 0 &&
            filteredValues.map((entry) => (
              <HeadlessCombobox.Option
                key={entry.id}
                value={entry}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={classNames(
                        'block truncate',
                        selected && 'font-semibold'
                      )}
                    >
                      {entry.label}
                    </span>

                    {selected && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-indigo-600'
                        )}
                      >
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </HeadlessCombobox.Option>
            ))}

          {filteredValues.length === 0 && (
            <HeadlessCombobox.Option
              key="combobox-not-found"
              className={() =>
                classNames('relative cursor-default select-none py-2 pl-3 pr-9')
              }
              value={{ id: null, label: null, value: null, resource: null }}
              disabled
            >
              {() => (
                <>
                  <span className={classNames('block truncate')}>
                    {t('no_records_found')}.
                  </span>
                </>
              )}
            </HeadlessCombobox.Option>
          )}
        </HeadlessCombobox.Options>
      </div>
    </HeadlessCombobox>
  );
}
