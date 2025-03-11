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
import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useClickAway, useDebounce } from 'react-use';
import { Alert } from '../Alert';
import { useColorScheme } from '$app/common/colors';
import { styled } from 'styled-components';
import { Spinner } from '../Spinner';
import Fuse from 'fuse.js';

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
  placeholder?: string;
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
  includeOnly?: (string | number | boolean)[];
  includeByLabel?: boolean;
  action?: Action;
  onChange: (entry: Entry<T>) => unknown;
  onEmptyValues?: (query: string) => unknown;
  onDismiss?: () => unknown;
  onFocus?: () => any;
  errorMessage?: string | string[];
  clearInputAfterSelection?: boolean;
  isDataLoading?: boolean;
  onInputValueChange?: (value: string) => void;
  compareOnlyByValue?: boolean;
  onFilter?: (entries: Entry<T>[]) => unknown;
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

const LiStyled = styled.li`
  background-color: ${(props) => props.theme.backgroundColor};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function Combobox<T = any>({
  inputOptions,
  entries,
  readonly,
  nullable,
  initiallyVisible = false,
  exclude = [],
  includeOnly = [],
  includeByLabel,
  action,
  onChange,
  onDismiss,
  entryOptions,
  errorMessage,
  clearInputAfterSelection,
  onEmptyValues,
  onFocus,
  onInputValueChange,
  onFilter,
}: ComboboxStaticProps<T>) {
  const [inputValue, setInputValue] = useState(
    String(inputOptions.value ?? '')
  );
  const [isOpen, setIsOpen] = useState(initiallyVisible);
  const [selectedOption, setSelectedOption] = useState<Entry | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  let filteredOptions =
    inputValue === ''
      ? entries
      : new Fuse(entries, { keys: ['id', 'label', 'searchable'] })
          .search(inputValue)
          .map((v) => v.item);

  filteredOptions = filteredOptions.filter((entry) =>
    exclude.length > 0 ? !exclude.includes(entry.value) : true
  );

  filteredOptions = filteredOptions.filter((entry) =>
    includeOnly.length > 0
      ? includeOnly.includes(entry[includeByLabel ? 'label' : 'value'])
      : true
  );

  useEffect(() => {
    const entry = entries.findIndex(
      (entry) =>
        entry.value === inputOptions.value || entry.label === inputOptions.value
    );

    if (entry >= 0) {
      setSelectedOption(entries[entry]);
      setHighlightedIndex(entry);

      return;
    }

    if (nullable) {
      setSelectedOption({
        id: -1,
        label: inputOptions.value ? inputOptions.value.toString() : '',
        value: inputOptions.value ? inputOptions.value.toString() : '',
        resource: null,
        eventType: 'internal',
        searchable: entryOptions.searchable || entryOptions.value,
      });

      return;
    }
  }, [entries]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setSelectedOption(null);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleOptionClick = (option: Entry) => {
    if (selectedOption && selectedOption.value === option.value) {
      return;
    }

    setSelectedOption(option);
    setInputValue(option.label);
    onChange(option);

    if (clearInputAfterSelection) {
      setInputValue('');
      setSelectedOption(null);
    }

    setTimeout(() => setIsOpen(false), 100);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key === 'ArrowDown' &&
      highlightedIndex < filteredOptions.length - 1
    ) {
      event.preventDefault();
      setHighlightedIndex(highlightedIndex + 1);

      return;
    }

    if (event.key === 'ArrowUp' && highlightedIndex > 0) {
      event.preventDefault();

      setHighlightedIndex(highlightedIndex - 1);

      return;
    }

    if (event.key === 'Enter') {
      setIsOpen(false);

      if (highlightedIndex >= 0) {
        handleOptionClick(filteredOptions[highlightedIndex]);

        return;
      }

      if (highlightedIndex === -1 && nullable) {
        handleOptionClick({
          id: Date.now(),
          label: inputValue,
          value: inputValue,
          resource: null,
          eventType: 'internal',
          searchable: inputValue.toLowerCase(),
        });
      }

      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);

      return;
    }

    if (event.key === 'Tab' && nullable) {
      setIsOpen(false);

      handleOptionClick({
        id: Date.now(),
        label: inputValue,
        value: inputValue,
        resource: null,
        eventType: 'internal',
        searchable: inputValue.toLowerCase(),
      });

      return;
    }
  };

  useClickAway(comboboxRef, () => {
    setIsOpen(false);
    onInputValueChange?.(inputValue);

    if (
      selectedOption &&
      selectedOption.value &&
      inputValue === selectedOption.value
    ) {
      return;
    }

    if (inputValue === '') {
      return;
    }

    const option: Entry = {
      id: Date.now(),
      label: inputValue,
      value: inputValue,
      resource: null,
      eventType: 'internal',
      searchable: inputValue.toLowerCase(),
    };

    handleOptionClick(option);
    onChange(option);
  });

  useDebounce(
    () => {
      if (onFilter) {
        onFilter(filteredOptions);
      }

      if (!onEmptyValues) {
        return;
      }

      if (inputValue === '' && filteredOptions.length > 0) {
        return onEmptyValues(inputValue);
      }

      if (filteredOptions.length <= 3) {
        return onEmptyValues(inputValue);
      }
    },
    600,
    [inputValue, filteredOptions]
  );

  useEffect(() => {
    const element = document.querySelector(
      `[data-combobox-element-id="${highlightedIndex + 1}"]`
    );

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }, [highlightedIndex]);

  const colors = useColorScheme();

  return (
    <div ref={comboboxRef} className="w-full" tabIndex={-1}>
      {inputOptions.label ? (
        <p className="text-sm font-medium block">{inputOptions.label}</p>
      ) : null}

      <div className="relative mt-1">
        <div
          className="relative w-full cursor-default overflow-hidden rounded border text-left sm:text-sm"
          style={{ borderColor: colors.$5 }}
        >
          <input
            type="text"
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsOpen(true);

              if (onFocus) {
                onFocus();
              }
            }}
            placeholder={inputOptions.placeholder}
            disabled={readonly}
            defaultValue={
              selectedOption ? selectedOption.label : inputValue?.toString()
            }
            className="w-full border-0 rounded py-1.5 pl-3 pr-10 shadow-sm sm:text-sm sm:leading-6"
            ref={inputRef}
            style={{
              backgroundColor: colors.$1,
              borderColor: colors.$5,
              color: colors.$3,
            }}
            data-cy="comboboxInput"
            tabIndex={-1}
          />

          {!readonly && (
            <button
              tabIndex={-1}
              type="button"
              onClick={(e) => {
                if (onDismiss) {
                  e.preventDefault();

                  setIsOpen(false);

                  return onDismiss();
                }
              }}
              className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
            >
              {onDismiss && selectedOption ? (
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
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <ul
          className="border absolute z-10 mt-1 max-h-60 overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
          tabIndex={-1}
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

          {filteredOptions.map((option, index) => (
            <LiStyled
              theme={{
                backgroundColor:
                  highlightedIndex === index ? colors.$2 : colors.$1,
              }}
              key={option.id}
              className={classNames(
                'min-w-[19rem] relative cursor-pointer select-none py-2 pl-3 pr-9 hover:font-semibold',
                {
                  'font-medium': highlightedIndex === index,
                }
              )}
              onClick={() => handleOptionClick(option)}
              data-combobox-element-id={index}
              tabIndex={-1}
            >
              {option.resource &&
              typeof entryOptions.dropdownLabelFn !== 'undefined'
                ? entryOptions.dropdownLabelFn(option.resource)
                : option.label}
            </LiStyled>
          ))}
        </ul>
      )}

      {errorMessage && (
        <Alert className="mt-2" type="danger">
          {errorMessage}
        </Alert>
      )}
    </div>
  );
}

export function ComboboxStatic<T = any>({
  inputOptions,
  entries,
  readonly,
  nullable,
  initiallyVisible = false,
  exclude = [],
  includeOnly = [],
  includeByLabel,
  action,
  onEmptyValues,
  onChange,
  onDismiss,
  entryOptions,
  errorMessage,
  clearInputAfterSelection,
  isDataLoading,
  compareOnlyByValue,
  onFilter,
}: ComboboxStaticProps<T>) {
  const [t] = useTranslation();
  const [selectedValue, setSelectedValue] = useState<Entry | null>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(initiallyVisible);

  let filteredValues =
    query === ''
      ? entries
      : new Fuse(entries, { keys: ['id', 'label', 'value', 'searchable'] })
          .search(query)
          .map((v) => v.item);

  filteredValues = filteredValues.filter((entry) =>
    exclude.length > 0 ? !exclude.includes(entry.value) : true
  );

  filteredValues = filteredValues.filter((entry) =>
    includeOnly.length > 0
      ? includeOnly.includes(entry[includeByLabel ? 'label' : 'value'])
      : true
  );

  const comboboxRef = useRef<HTMLDivElement>(null);
  const comboboxInputRef = useRef<HTMLInputElement>(null);

  useClickAway(comboboxRef, () => {
    setIsOpen(false);
  });

  useDebounce(
    () => {
      if (onFilter) {
        onFilter(filteredValues);
      }

      if (!onEmptyValues) {
        return;
      }

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

    setIsOpen(false);

    if (comboboxInputRef?.current) {
      comboboxInputRef.current.blur();
    }
  }, [selectedValue]);

  useEffect(() => {
    const entry = entries.find((entry) =>
      compareOnlyByValue
        ? entry.value === inputOptions.value
        : entry.value === inputOptions.value ||
          entry.label === inputOptions.value
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
        onChange={(value: Entry | null) => handleChangeValue(value)}
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
              ref={comboboxInputRef}
              className="w-full border-0 rounded py-1.5 pl-3 pr-10 shadow-sm sm:text-sm sm:leading-6"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(entry: Nullable<Entry>) =>
                entryOptions.inputLabelFn?.(entry?.resource) ??
                (entry?.label || query)
              }
              onClick={() => setIsOpen(true)}
              placeholder={inputOptions.placeholder}
              style={{
                backgroundColor: colors.$1,
                borderColor: colors.$5,
                color: colors.$3,
              }}
            />

            {!readonly && (
              <HeadlessCombobox.Button
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  if (onDismiss) {
                    e.preventDefault();

                    setQuery('');

                    selectedValue && setIsOpen(false);

                    !selectedValue && setIsOpen((current) => !current);

                    return onDismiss();
                  } else {
                    setIsOpen((current) => !current);
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

            {Boolean(isDataLoading) && (
              <div className="min-w-[19rem] relative cursor-default select-none py-2 pl-3 pr-9">
                <Spinner />
              </div>
            )}

            {!isDataLoading && !filteredValues.length && (
              <div className="min-w-[19rem] relative cursor-default select-none py-2 pl-3 pr-9">
                {t('no_records_found')}
              </div>
            )}

            {nullable && query.length > 0 && !isDataLoading && (
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
                {({ active }) => (
                  <span
                    className={classNames(
                      'block truncate space-x-1',
                      active && 'font-semibold'
                    )}
                  >
                    <span>{t('Select')}</span>
                    <q className="font-semibold">{query}</q>
                  </span>
                )}
              </HeadlessCombobox.Option>
            )}

            {filteredValues.length > 0 &&
              !isDataLoading &&
              filteredValues.map((entry) => (
                <HeadlessOptionStyled
                  theme={{
                    hoverColor: colors.$2,
                  }}
                  key={entry.id}
                  value={entry}
                  className="min-w-[19rem] relative cursor-default select-none py-2 pl-3 pr-9"
                  // active ? 'bg-gray-100 text-gray-900' : 'text-gray-900'
                  style={{ color: colors.$3 }}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={classNames(
                          'block truncate',
                          selected && 'font-semibold',
                          active && 'font-semibold'
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
  customSearchableValue?: (resource: T) => string;
  customValue?: (entry: T) => string;
}

export interface ComboboxAsyncProps<T> {
  endpoint: string;
  inputOptions: InputOptions;
  entryOptions: EntryOptions<T>;
  readonly?: boolean;
  staleTime?: number;
  initiallyVisible?: boolean;
  querySpecificEntry?: string;
  sortBy?: string | null;
  exclude?: (string | number | boolean)[];
  includeOnly?: (string | number | boolean)[];
  includeByLabel?: boolean;
  action?: Action;
  nullable?: boolean;
  onChange: (entry: Entry<T>) => unknown;
  onDismiss?: () => unknown;
  disableWithQueryParameter?: boolean;
  errorMessage?: string | string[];
  clearInputAfterSelection?: boolean;
  onInputValueChange?: (value: string) => void;
  compareOnlyByValue?: boolean;
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
  includeOnly,
  includeByLabel,
  action,
  nullable,
  onChange,
  onDismiss,
  disableWithQueryParameter,
  errorMessage,
  clearInputAfterSelection,
  onInputValueChange,
  compareOnlyByValue,
}: ComboboxAsyncProps<T>) {
  const [entries, setEntries] = useState<Entry<T>[]>([]);
  const [url, setUrl] = useState(endpoint);
  const [enableQuery, setEnableQuery] = useState<boolean>(false);
  const [filtered, setFiltered] = useState<Entry<T>[]>([]);

  useEffect(() => {
    setUrl(endpoint);
  }, [endpoint]);

  const enableQueryTimeOut = useRef<NodeJS.Timeout | undefined>(undefined);

  const isEntryAvailable = () => {
    if (entries.length) {
      const entry = entries.find(
        (entry) =>
          entry.value === inputOptions.value ||
          entry.label === inputOptions.value
      );

      return Boolean(entry);
    }

    return true;
  };

  const { data, isLoading } = useQuery(
    [new URL(url).pathname, new URL(url).pathname + new URL(url).search],
    () =>
      request('GET', new URL(url).href).then(
        (response: AxiosResponse<GenericManyResponse<any>>) => {
          const data: Entry<T>[] = [];

          response.data.data.map((entry) =>
            data.push({
              id: entry[entryOptions.id],
              label: entry[entryOptions.label],
              value: entryOptions.customValue
                ? entryOptions.customValue(entry)
                : entry[entryOptions.value],
              resource: entry,
              eventType: 'external',
              searchable:
                entryOptions.customSearchableValue?.(entry) ||
                entry[entryOptions.searchable || entryOptions.id],
            })
          );

          return data;
        }
      ),
    {
      staleTime: staleTime ?? Infinity,
      enabled: enableQuery,
    }
  );

  useEffect(() => {
    if (url.includes('/api/v1/products')) {
      return;
    }

    if (!enableQuery) {
      clearTimeout(enableQueryTimeOut.current);

      const currentTimeout = setTimeout(() => setEnableQuery(true), 100);

      enableQueryTimeOut.current = currentTimeout;
    }
  }, [inputOptions.value]);

  useEffect(() => {
    if (
      enableQuery &&
      inputOptions.value &&
      !disableWithQueryParameter &&
      !isEntryAvailable()
    ) {
      setUrl((c) => {
        const currentUrl = new URL(c);

        if (inputOptions.value && inputOptions.value.toString().length > 0) {
          currentUrl.searchParams.set('with', inputOptions.value.toString());

          if (currentUrl.searchParams.get('sort')) {
            currentUrl.searchParams.delete('sort');
          }
        }

        return currentUrl.href;
      });
    }

    if (enableQuery && !inputOptions.value) {
      setUrl((c) => {
        const currentUrl = new URL(c);

        if (currentUrl.searchParams.get('with')) {
          currentUrl.searchParams.delete('with');
        }

        if (sortBy) {
          currentUrl.searchParams.set('sort', sortBy);
        }

        return currentUrl.href;
      });
    }
  }, [entries, enableQuery, inputOptions.value]);

  useEffect(() => {
    if (data) {
      setEntries([...data]);
    }
  }, [data]);

  useEffect(() => {
    setUrl((c) => {
      const currentUrl = new URL(c);

      if (sortBy) {
        currentUrl.searchParams.set('sort', sortBy);
      }

      currentUrl.searchParams.set('status', 'active');

      currentUrl.searchParams.set('filter', '');

      return currentUrl.href;
    });

    return () => {
      setEntries([]);
      setEnableQuery(false);
      enableQueryTimeOut.current = undefined;
    };
  }, []);

  const onEmptyValues = (query: string) => {
    setUrl((c) => {
      const url = new URL(c);

      console.log({ query, filtered });

      if (filtered.length === 0 || query === '') {
        url.searchParams.set('filter', query);
      }

      return url.href;
    });
  };

  if (url.includes('/api/v1/products')) {
    return (
      <Combobox
        entries={entries}
        inputOptions={inputOptions}
        readonly={readonly}
        onChange={onChange}
        onDismiss={onDismiss}
        initiallyVisible={initiallyVisible}
        exclude={exclude}
        includeOnly={includeOnly}
        includeByLabel={includeByLabel}
        action={action}
        nullable={nullable}
        entryOptions={entryOptions}
        errorMessage={errorMessage}
        clearInputAfterSelection={clearInputAfterSelection}
        isDataLoading={isLoading}
        onFocus={() => setEnableQuery(true)}
        onInputValueChange={onInputValueChange}
        onEmptyValues={onEmptyValues}
        compareOnlyByValue={compareOnlyByValue}
        onFilter={setFiltered}
      />
    );
  }

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
      includeOnly={includeOnly}
      includeByLabel={includeByLabel}
      action={action}
      nullable={nullable}
      entryOptions={entryOptions}
      errorMessage={errorMessage}
      clearInputAfterSelection={clearInputAfterSelection}
      isDataLoading={isLoading}
      onInputValueChange={onInputValueChange}
      compareOnlyByValue={compareOnlyByValue}
      onFilter={setFiltered}
    />
  );
}
