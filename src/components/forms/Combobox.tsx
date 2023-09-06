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
import { Alert } from '../Alert';
import { useColorScheme } from '$app/common/colors';
import { styled } from 'styled-components';

export interface Entry<T = any> {
  id: number | string;
  label: string;
  value: string | number | boolean;
  resource: T | null;
  eventType: EventType;
  searchable: string;
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
  errorMessage?: string | string[];
  clearInputAfterSelection?: boolean;
}

export type Nullable<T> = T | null;

const HeadlessOptionStyled = styled(HeadlessCombobox.Option)`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

const ActionButtonStyled = styled.button`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

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
  errorMessage,
  clearInputAfterSelection,
}: ComboboxStaticProps) {
  const [t] = useTranslation();
  const [selectedValue, setSelectedValue] = useState<Entry | null>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(initiallyVisible);

  let filteredValues =
    query === ''
      ? entries
      : entries.filter(
          (entry) =>
            entry.label?.toLowerCase()?.includes(query?.toLowerCase()) ||
            entry.value
              ?.toString()
              ?.toLowerCase()
              ?.includes(query?.toLowerCase()) ||
            entry.searchable.toLowerCase().includes(query?.toLowerCase())
        );

  filteredValues = filteredValues.filter((entry) =>
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

      if (filteredValues.length <= 3) {
        return onEmptyValues(query);
      }
    },
    600,
    [filteredValues]
  );

  const handleChangeValue = (value: Entry | null) => {
    if (value) {
      if (selectedValue && value.value === selectedValue.value) {
        onDismiss && onDismiss();
      } else {
        setSelectedValue(() => ({ ...value, eventType: 'internal' }));
      }
    }
  };

  useEffect(() => {
    if (selectedValue && selectedValue.eventType === 'internal') {
      onChange(selectedValue);
    }

    if (clearInputAfterSelection) {
      setSelectedValue(null);
      setQuery('');
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
          searchable: entryOptions.searchable || entryOptions.value,
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

  const colors = useColorScheme();

  return (
    <div className="w-full">
      <HeadlessCombobox
        as="div"
        value={selectedValue}
        onChange={(value) => handleChangeValue(value)}
        disabled={readonly}
        ref={comboboxRef}
      >
        {inputOptions.label && (
          <HeadlessCombobox.Label
            className="text-sm font-medium block"
            style={{ color: colors.$3 }}
          >
            {inputOptions.label}
          </HeadlessCombobox.Label>
        )}

        <div className="relative mt-1">
          <div
            className="relative w-full cursor-default overflow-hidden rounded border text-left sm:text-sm"
            style={{ borderColor: colors.$5 }}
          >
            <HeadlessCombobox.Input
              data-testid="combobox-input-field"
              className="w-full border-0 rounded py-1.5 pl-3 pr-10 shadow-sm sm:text-sm sm:leading-6"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(entry: Nullable<Entry>) =>
                entryOptions.inputLabelFn?.(entry?.resource) ??
                (entry?.label || '')
              }
              onFocus={() => setIsOpen(true)}
              style={{
                backgroundColor: colors.$1,
                borderColor: colors.$5,
                color: colors.$3,
              }}
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
                  <X
                    className="h-5 w-5"
                    aria-hidden="true"
                    data-testid="combobox-clear-icon"
                    style={{ color: colors.$3 }}
                  />
                ) : (
                  <ChevronDown
                    className="h-5 w-5"
                    aria-hidden="true"
                    data-testid="combobox-chevrondown-icon"
                    style={{ color: colors.$3 }}
                  />
                )}
              </HeadlessCombobox.Button>
            )}
          </div>
        </div>

        {isOpen && (
          <HeadlessCombobox.Options
            static
            className="border absolute z-10 mt-1 max-h-60 overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
          >
            {action && action.visible && (
              <ActionButtonStyled
                theme={{
                  hoverColor: colors.$2,
                }}
                data-testid="combobox-action-button"
                type="button"
                onClick={action.onClick}
                className="min-w-[19rem] relative cursor-pointer select-none py-2 pl-3 pr-9"
                tabIndex={-1}
                style={{ color: colors.$3 }}
              >
                {action.label}
              </ActionButtonStyled>
            )}

            {filteredValues.length > 0 &&
              filteredValues.map((entry) => (
                <HeadlessOptionStyled
                  theme={{
                    hoverColor: colors.$2,
                  }}
                  key={entry.id}
                  value={entry}
                  className={() =>
                    classNames(
                      'min-w-[19rem] relative cursor-default select-none py-2 pl-3 pr-9'
                      // active ? 'bg-gray-100 text-gray-900' : 'text-gray-900'
                    )
                  }
                  style={{ color: colors.$3 }}
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
                        typeof entryOptions.dropdownLabelFn !== 'undefined'
                          ? entryOptions.dropdownLabelFn(entry.resource)
                          : entry.label}
                      </span>

                      {selected && (
                        <span
                          className="absolute inset-y-0 right-0 flex items-center pr-4"
                          style={{ color: colors.$3 }}
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </HeadlessOptionStyled>
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

      {errorMessage && (
        <Alert className="mt-2" type="danger">
          {errorMessage}
        </Alert>
      )}
    </div>
  );
}

interface EntryOptions<T = any> {
  id: string;
  label: string;
  value: string;
  searchable?: string;
  dropdownLabelFn?: (resource: T) => string | JSX.Element;
  inputLabelFn?: (resource?: T) => string;
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
  disableWithQueryParameter?: boolean;
  errorMessage?: string | string[];
  clearInputAfterSelection?: boolean;
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
  disableWithQueryParameter,
  errorMessage,
  clearInputAfterSelection,
}: ComboboxAsyncProps<T>) {
  const [entries, setEntries] = useState<Entry<T>[]>([]);
  const [url, setUrl] = useState(endpoint);

  const { data, refetch } = useQuery(
    [url.pathname, url.searchParams.toString()],
    () => {
      if (sortBy) {
        url.searchParams.set('sort', sortBy);
      }

      url.searchParams.set('status', 'active');

      if (inputOptions.value && !disableWithQueryParameter) {
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
              searchable: entry[entryOptions.searchable || entryOptions.id],
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

  useEffect(() => {
    setUrl(() => new URL(endpoint.href));
    refetch();
  }, [endpoint.href]);

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
      errorMessage={errorMessage}
      clearInputAfterSelection={clearInputAfterSelection}
    />
  );
}
