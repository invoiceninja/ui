/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { request } from '$app/common/helpers/request';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { Combobox as HeadlessCombobox } from '@headlessui/react';
import { AxiosResponse } from 'axios';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useClickAway, useDebounce } from 'react-use';

export interface Entry<T = any> {
  id: number | string;
  label: string;
  value: string | number | boolean;
  resource: T | null;
  eventType: EventType;
}

type EventType = 'internal' | 'external';

interface InputOptions {
  value: string | number | boolean | null;
  label?: string;
}

interface Action {
  label: string;
  visible: boolean;
  onClick: () => unknown;
}

export interface ComboboxStaticProps<T = any> {
  inputOptions: InputOptions;
  entries: Entry<T>[];
  entryOptions: EntryOptions<T>;
  readonly?: boolean;
  nullable?: boolean;
  initiallyVisible?: boolean;
  exclude?: (string | number | boolean)[];
  action?: Action;
  onChange: (entry: Entry<T>) => unknown;
  onEmptyValues: (query: string) => unknown;
  onDismiss?: () => unknown;
}

export type Nullable<T> = T | null;

export function ComboboxStatic({
  inputOptions,
  entries,
  readonly,
  nullable,
  initiallyVisible = false,
  exclude = [],
  action,
  onEmptyValues,
  onChange,
  onDismiss,
  entryOptions,
}: ComboboxStaticProps) {
  const [t] = useTranslation();
  const [selectedValue, setSelectedValue] = useState<Entry | null>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(initiallyVisible);

  const filteredValues =
    query === ''
      ? entries
      : entries
          .filter(
            (entry) =>
              entry.label?.toLowerCase()?.includes(query?.toLowerCase()) ||
              entry.value
                ?.toString()
                ?.toLowerCase()
                ?.includes(query?.toLowerCase())
          )
          .filter((entry) =>
            exclude.length > 0 ? !exclude.includes(entry.value) : true
          );

  const comboboxRef = useRef<HTMLDivElement>(null);

  useClickAway(comboboxRef, () => {
    setIsOpen(false);
  });

  useDebounce(
    () => {
      if (query === '' && filteredValues.length > 0) {
        return onEmptyValues(query);
      }

      if (filteredValues.length === 0) {
        return onEmptyValues(query);
      }
    },
    600,
    [filteredValues]
  );

  useEffect(() => {
    if (selectedValue && selectedValue.eventType === 'internal') {
      onChange(selectedValue);
    }
  }, [selectedValue]);

  useEffect(() => {
    const entry = entries.find(
      (entry) =>
        entry.value === inputOptions.value || entry.label === inputOptions.value
    );

    entry
      ? setSelectedValue(entry)
      : nullable
      ? setSelectedValue({
          id: -1,
          label: inputOptions.value ? inputOptions.value.toString() : '',
          value: inputOptions.value ? inputOptions.value.toString() : '',
          resource: null,
          eventType: 'external',
        })
      : setSelectedValue(null);
  }, [entries, inputOptions.value]);

  useEffect(() => {
    if (initiallyVisible) {
      setIsOpen(true);
    }

    return () => {
      setIsOpen(false);
    };
  }, [initiallyVisible]);

  return (
    <div className="w-full">
      <HeadlessCombobox
        as="div"
        value={selectedValue}
        onChange={(value) =>
          setSelectedValue(() => value && { ...value, eventType: 'internal' })
        }
        disabled={readonly}
        ref={comboboxRef}
      >
        {inputOptions.label && (
          <HeadlessCombobox.Label className="text-sm text-gray-500 font-medium block">
            {inputOptions.label}
          </HeadlessCombobox.Label>
        )}

        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded border border-gray-300 bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 sm:text-sm">
            <HeadlessCombobox.Input
              className="w-full rounded border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(entry: Nullable<Entry>) => entry?.label ?? ''}
              onFocus={() => setIsOpen(true)}
            />

            {!readonly && (
              <HeadlessCombobox.Button
                onClick={(e) => {
                  if (onDismiss) {
                    e.preventDefault();

                    setIsOpen(false);

                    return onDismiss();
                  }
                }}
                className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
              >
                {onDismiss && selectedValue ? (
                  <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
                ) : (
                  <ChevronDown
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                )}
              </HeadlessCombobox.Button>
            )}
          </div>
        </div>

        {isOpen && (
          <HeadlessCombobox.Options
            static
            className="absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          >
            {action && action.visible && (
              <button
                type="button"
                onClick={action.onClick}
                className="min-w-[19rem] relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-gray-100"
                tabIndex={-1}
              >
                {action.label}
              </button>
            )}

            {filteredValues.length > 0 &&
              filteredValues.map((entry) => (
                <HeadlessCombobox.Option
                  key={entry.id}
                  value={entry}
                  className={({ active }) =>
                    classNames(
                      'min-w-[19rem] relative cursor-default select-none py-2 pl-3 pr-9',
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-900'
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={classNames(
                          'block truncate',
                          selected && 'font-semibold'
                        )}
                      >
                        {entry.resource &&
                        typeof entryOptions.labelFn !== 'undefined'
                          ? entryOptions.labelFn(entry.resource)
                          : entry.label}
                      </span>

                      {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600">
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
                className="min-w-[19rem] relative cursor-default select-none py-2 pl-3 pr-9"
                value={{
                  id: -1,
                  label: nullable ? query : null,
                  value: nullable ? query : null,
                  resource: null,
                }}
              >
                {nullable && query.length > 0 ? (
                  <span className="block truncate space-x-1">
                    <span>{t('Select')}</span>
                    <q className="font-semibold">{query}</q>
                  </span>
                ) : (
                  <span className="block truncate">
                    {t('no_records_found')}.
                  </span>
                )}
              </HeadlessCombobox.Option>
            )}
          </HeadlessCombobox.Options>
        )}
      </HeadlessCombobox>
    </div>
  );
}

interface EntryOptions<T = any> {
  id: string;
  label: string;
  value: string;
  labelFn?: (resource: T) => string | JSX.Element;
}

export interface ComboboxAsyncProps<T> {
  endpoint: URL;
  inputOptions: InputOptions;
  entryOptions: EntryOptions<T>;
  readonly?: boolean;
  staleTime?: number;
  initiallyVisible?: boolean;
  querySpecificEntry?: string;
  sortBy?: string | null;
  exclude?: (string | number | boolean)[];
  action?: Action;
  nullable?: boolean;
  onChange: (entry: Entry<T>) => unknown;
  onDismiss?: () => unknown;
}

export function ComboboxAsync<T = any>({
  endpoint,
  inputOptions,
  entryOptions,
  readonly,
  staleTime,
  initiallyVisible,
  sortBy = 'created_at|desc',
  exclude,
  action,
  nullable,
  onChange,
  onDismiss,
}: ComboboxAsyncProps<T>) {
  const [entries, setEntries] = useState<Entry<T>[]>([]);
  const [url, setUrl] = useState(endpoint);

  const { data } = useQuery(
    [url.pathname, url.searchParams.toString()],
    () => {
      if (sortBy) {
        url.searchParams.set('sort', sortBy);
      }

      url.searchParams.set('status', 'active');

      if (inputOptions.value) {
        url.searchParams.set('with', inputOptions.value.toString());
      }

      return request('GET', url.href).then(
        (response: AxiosResponse<GenericManyResponse<any>>) => {
          const data: Entry<T>[] = [];

          response.data.data.map((entry) =>
            data.push({
              id: entry[entryOptions.id],
              label: entry[entryOptions.label],
              value: entry[entryOptions.value],
              resource: entry,
              eventType: 'external',
            })
          );

          return data;
        }
      );
    },
    {
      staleTime: staleTime ?? Infinity,
    }
  );

  useEffect(() => {
    if (data) {
      setEntries([...data]);
    }
  }, [data]);

  useEffect(() => {
    return () => setEntries([]);
  }, []);

  const onEmptyValues = (query: string) => {
    setUrl((current) => {
      current.searchParams.set('filter', query);

      return new URL(current.href);
    });
  };

  return (
    <ComboboxStatic
      entries={entries}
      inputOptions={inputOptions}
      readonly={readonly}
      onChange={onChange}
      onEmptyValues={onEmptyValues}
      onDismiss={onDismiss}
      initiallyVisible={initiallyVisible}
      exclude={exclude}
      action={action}
      nullable={nullable}
      entryOptions={entryOptions}
    />
  );
}
