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
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useClickAway, useDebounce } from 'react-use';
import { Alert } from '../Alert';
import { useColorScheme } from '$app/common/colors';
import { styled } from 'styled-components';
import { Spinner } from '../Spinner';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { ChevronDown } from '../icons/ChevronDown';
import { XMark } from '../icons/XMark';
import { Plus } from '../icons/Plus';
import { Check } from '../icons/Check';

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
  className?: string;
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
  withShadow?: boolean;
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
  withShadow,
}: ComboboxStaticProps<T>) {
  const colors = useColorScheme();
  const reactSettings = useReactSettings();

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
      : entries.filter(
          (entry) =>
            entry.label?.toLowerCase()?.includes(inputValue?.toLowerCase()) ||
            entry.value
              ?.toString()
              ?.toLowerCase()
              ?.includes(inputValue?.toLowerCase()) ||
            entry.searchable.toLowerCase().includes(inputValue?.toLowerCase())
        );

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

  return (
    <div ref={comboboxRef} className="w-full" tabIndex={-1}>
      {inputOptions.label ? (
        <p
          className={classNames(
            'text-sm font-medium block',
            inputOptions.className
          )}
          style={{ color: colors.$16 }}
        >
          {inputOptions.label}
        </p>
      ) : null}

      <div className="relative mt-1">
        <div
          className={classNames(
            'relative w-full cursor-default overflow-hidden rounded-md border text-left sm:text-sm',
            {
              'shadow-sm': withShadow,
              'border-[#09090B26]': !reactSettings.dark_mode && !isOpen,
              'border-black': !reactSettings.dark_mode && isOpen,
              'border-[#1f2e41]': reactSettings.dark_mode && !isOpen,
              'border-white': reactSettings.dark_mode && isOpen,
            }
          )}
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
            className="w-full rounded-md py-1.5 pl-3 pr-10 shadow-sm sm:text-sm sm:leading-6 focus:outline-none focus:ring-0"
            ref={inputRef}
            style={{
              backgroundColor: colors.$1,
              color: colors.$3,
              border: 'none',
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
                <XMark
                  size="0.9rem"
                  color={colors.$3}
                  data-testid="combobox-clear-icon"
                />
              ) : (
                <ChevronDown
                  color={colors.$3}
                  size="0.9rem"
                  data-testid="combobox-chevrondown-icon"
                />
              )}
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <ul
          className="border absolute z-10 mt-1 rounded-md text-base shadow-2xl focus:outline-none sm:text-sm"
          style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
          tabIndex={-1}
        >
          <div className="flex flex-col overflow-y-auto overflow-x-hidden max-h-60 p-1">
            {filteredOptions.map((option, index) => (
              <LiStyled
                theme={{
                  backgroundColor: colors.$1,
                  hoverColor: colors.$20,
                }}
                key={option.id}
                className="flex items-center space-x-2 min-w-[14rem] max-w-[17rem] relative cursor-pointer select-none py-2 px-3 rounded-[0.1875rem]"
                onClick={() => handleOptionClick(option)}
                data-combobox-element-id={index}
                tabIndex={-1}
              >
                {highlightedIndex === index && (
                  <div className="self-start mt-1">
                    <Check size="0.9rem" color={colors.$3} />
                  </div>
                )}

                <div
                  className={classNames('truncate', {
                    'pl-6': highlightedIndex !== index && selectedOption?.value,
                  })}
                >
                  {option.resource &&
                  typeof entryOptions.dropdownLabelFn !== 'undefined'
                    ? entryOptions.dropdownLabelFn(option.resource)
                    : option.label}
                </div>
              </LiStyled>
            ))}
          </div>

          {action && action.visible && (
            <div
              className="border-t w-full p-1"
              style={{ borderColor: colors.$21 }}
            >
              <ActionButtonStyled
                theme={{
                  hoverColor: colors.$20,
                }}
                data-testid="combobox-action-button"
                type="button"
                onClick={action.onClick}
                className="flex items-center space-x-2 justify-start w-full relative cursor-pointer select-none py-2 px-3 rounded-[0.1875rem]"
                tabIndex={-1}
                style={{ color: colors.$3 }}
              >
                <div>
                  <Plus size="1rem" color={colors.$16} />
                </div>

                <span className="text-sm font-medium">{action.label}</span>
              </ActionButtonStyled>
            </div>
          )}
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
  withShadow,
}: ComboboxStaticProps<T>) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const reactSettings = useReactSettings();

  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(initiallyVisible);
  const [selectedValue, setSelectedValue] = useState<Entry | null>(null);

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
            className={classNames(
              'text-sm font-medium block',
              inputOptions.className
            )}
            style={{ color: colors.$16 }}
          >
            {inputOptions.label}
          </HeadlessCombobox.Label>
        )}

        <div className="relative mt-1">
          <div
            className={classNames(
              'relative w-full cursor-default overflow-hidden rounded-md border text-left sm:text-sm',
              {
                'shadow-sm': withShadow,
                'border-[#09090B26]': !reactSettings.dark_mode && !isOpen,
                'border-black': !reactSettings.dark_mode && isOpen,
                'border-[#1f2e41]': reactSettings.dark_mode && !isOpen,
                'border-white': reactSettings.dark_mode && isOpen,
              }
            )}
          >
            <HeadlessCombobox.Input
              data-testid="combobox-input-field"
              ref={comboboxInputRef}
              className="w-full rounded-md py-1.5 pl-3 pr-10 sm:text-sm sm:leading-6 focus:outline-none focus:ring-0"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(entry: Nullable<Entry>) =>
                entryOptions.inputLabelFn?.(entry?.resource) ??
                (entry?.label || query)
              }
              onClick={() => setIsOpen(true)}
              placeholder={inputOptions.placeholder}
              style={{
                backgroundColor: colors.$1,
                color: colors.$3,
                border: 'none',
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
                className="absolute inset-y-0 right-0 flex items-center rounded-r-md pl-2 pr-3 focus:outline-none"
              >
                {onDismiss && selectedValue ? (
                  <XMark
                    size="0.9rem"
                    color={colors.$3}
                    data-testid="combobox-clear-icon"
                  />
                ) : (
                  <ChevronDown
                    color={colors.$3}
                    size="1rem"
                    data-testid="combobox-chevrondown-icon"
                  />
                )}
              </HeadlessCombobox.Button>
            )}
          </div>
        </div>

        {isOpen && (
          <HeadlessCombobox.Options
            static
            className="border absolute z-10 mt-1 rounded-md shadow-2xl focus:outline-none sm:text-sm"
            style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
          >
            <div className="flex flex-col overflow-y-auto overflow-x-hidden max-h-60 p-1">
              {Boolean(isDataLoading) && (
                <div className="min-w-[14rem] max-w-[17rem] relative cursor-default select-none py-2 pl-3 pr-9">
                  <Spinner />
                </div>
              )}

              {!isDataLoading && !filteredValues.length && (
                <div className="min-w-[14rem] max-w-[17rem] relative cursor-default select-none py-2 px-3 text-sm font-medium">
                  {t('no_records_found')}.
                </div>
              )}

              {nullable && query.length > 0 && !isDataLoading && (
                <HeadlessOptionStyled
                  theme={{
                    hoverColor: colors.$20,
                  }}
                  key="combobox-not-found"
                  className="min-w-[14rem] max-w-[17rem] relative cursor-pointer select-none py-2 px-3 rounded-[0.1875rem]"
                  value={{
                    id: -1,
                    label: nullable ? query : null,
                    value: nullable ? query : null,
                    resource: null,
                  }}
                >
                  {() => (
                    <div className="block truncate space-x-1">
                      <span>{t('Select')}</span>

                      <q className="font-semibold">{query}</q>
                    </div>
                  )}
                </HeadlessOptionStyled>
              )}

              {filteredValues.length > 0 &&
                !isDataLoading &&
                filteredValues.map((entry) => (
                  <HeadlessOptionStyled
                    theme={{
                      hoverColor: colors.$20,
                    }}
                    key={entry.id}
                    value={entry}
                    className="min-w-[14rem] max-w-[17rem] relative cursor-pointer select-none py-2 px-3 rounded-[0.1875rem]"
                    style={{ color: colors.$3 }}
                  >
                    {({ selected }) => (
                      <div className="flex items-center space-x-2">
                        {selected && (
                          <div
                            className="self-start mt-1"
                            style={{ color: colors.$3 }}
                          >
                            <Check size="0.9rem" color={colors.$3} />
                          </div>
                        )}

                        <div
                          className={classNames('block truncate', {
                            'pl-6': !selected && selectedValue?.value,
                          })}
                        >
                          {entry.resource &&
                          typeof entryOptions.dropdownLabelFn !== 'undefined'
                            ? entryOptions.dropdownLabelFn(entry.resource)
                            : entry.label}
                        </div>
                      </div>
                    )}
                  </HeadlessOptionStyled>
                ))}
            </div>

            {action && action.visible && (
              <div
                className="border-t w-full p-1"
                style={{ borderColor: colors.$21 }}
              >
                <ActionButtonStyled
                  theme={{
                    hoverColor: colors.$20,
                  }}
                  data-testid="combobox-action-button"
                  type="button"
                  onClick={action.onClick}
                  className="flex items-center space-x-2 justify-start w-full relative cursor-pointer select-none py-2 px-3 rounded-[0.1875rem]"
                  tabIndex={-1}
                  style={{ color: colors.$3 }}
                >
                  <div>
                    <Plus size="1rem" color={colors.$16} />
                  </div>

                  <span className="text-sm font-medium">{action.label}</span>
                </ActionButtonStyled>
              </div>
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
  withShadow?: boolean;
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
  withShadow,
}: ComboboxAsyncProps<T>) {
  const [entries, setEntries] = useState<Entry<T>[]>([]);
  const [url, setUrl] = useState(endpoint);
  const [enableQuery, setEnableQuery] = useState<boolean>(false);

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

      url.searchParams.set('filter', query);

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
        withShadow={withShadow}
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
      withShadow={withShadow}
    />
  );
}
