/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useRef, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronDown, X } from 'react-feather';
import { clone, debounce } from 'lodash';
import { endpoint } from 'common/helpers';
import { useQueryClient } from 'react-query';
import { InputLabel } from './InputLabel';
import { Spinner } from 'components/Spinner';
import { useTranslation } from 'react-i18next';
import { Alert } from 'components/Alert';
import { request as httpRequest } from 'common/helpers/request';

export interface Record<T = any> {
  value: string | number;
  label: string;
  internal: boolean;
  resource?: T;
}

interface Props {
  endpoint: string;
  value?: string;
  label: string;
  placeholder?: string;
  className?: string;
  onChange: (value: Record) => any;
  formatLabel?: (resource: any) => any;
  onActionClick?: () => any;
  actionLabel?: string;
  defaultValue?: string | number | boolean;
  disabled?: boolean;
  clearButton?: any;
  onClearButtonClick?: any;
  inputLabel?: string;
  onInputFocus?: () => unknown;
  exclude?: (string | number)[];
  clearInputAfterSelection?: boolean;
  withShadowRecord?: boolean;
  errorMessage?: string | string[];
  queryAdditional?: boolean;
}

export function DebouncedCombobox(props: Props) {
  const internalRecord = { value: '', label: '', internal: true };

  const [t] = useTranslation();
  const [records, setRecords] = useState<Record[]>([internalRecord]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([
    internalRecord,
  ]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedOption, setSelectedOption] = useState({
    record: records[0],
    withoutEvents: true,
  });

  const [defaultValueProperty, setDefaultValueProperty] = useState('');
  const openDropdownButton = useRef<HTMLButtonElement | undefined>();
  const queryClient = useQueryClient();

  useEffect(() => {
    setDefaultValueProperty(props.defaultValue as string);
  }, [props.defaultValue]);

  const request = (query: string, staleTime = Infinity) => {
    setIsLoading(true);

    const url = new URL(endpoint(props.endpoint));

    if (query) {
      url.searchParams.set('filter', query);
    }

    url.searchParams.set('sort', 'created_at|desc');
    url.searchParams.set('is_deleted', 'false');

    queryClient
      .fetchQuery(url.href, () => httpRequest('GET', url.href), { staleTime })
      .then((response) => {
        const array: Record[] = [internalRecord];

        response?.data?.data?.map((resource: any) =>
          array.push({
            value: resource[props.value ?? 'id'],
            label: props.formatLabel
              ? props.formatLabel(resource)
              : resource[props.label],
            internal: false,
            resource,
          })
        );

        setRecords(array);
        setIsLoading(false);
      });
  };

  const debouncedSearch = debounce((query) => {
    const internal = records.findIndex((record) => record.internal);

    request(query);

    setRecords((current) => {
      current[internal].label = query;
      current[internal].value = query;

      return current;
    });

    const record = clone(records[0]);

    setSelectedOption({ record, withoutEvents: false });
  }, 1500);

  const filter = () => {
    setFilteredRecords(
      records.filter((record) =>
        props.exclude ? !props.exclude.includes(record.value) : true
      )
    );
  };

  useEffect(() => {
    if (!props.disabled && selectedOption.withoutEvents === false) {
      filter();

      if (!selectedOption.record.internal) {
        props.onChange(selectedOption.record);
      } else if (selectedOption.record.internal && props.withShadowRecord) {
        props.onChange(selectedOption.record);
      }

      if (props.clearInputAfterSelection) {
        setSelectedOption({ record: internalRecord, withoutEvents: true });
      }
    }
  }, [selectedOption]);

  useEffect(() => {
    const organiseResults = async () => {
      const potential = records.find(
        (record) =>
          record.value == defaultValueProperty ||
          record.label == defaultValueProperty
      );

      if (potential) {
        setSelectedOption({ record: potential, withoutEvents: false });
      } else if (!potential && props.defaultValue && props.queryAdditional) {
        // Try to query the result to get the possible record.
        const url = new URL(endpoint(props.endpoint));
        const withoutQueryParams = url.href.replace(url.search, '');

        const resource = await httpRequest(
          'GET',
          `${withoutQueryParams}/${props.defaultValue}`
        );

        setRecords((current) => {
          const currentPossible = current.find(
            (record) =>
              record.value === defaultValueProperty ||
              record.label === defaultValueProperty
          );

          return !currentPossible
            ? [
                ...current,
                {
                  value: resource.data.data[props.value ?? 'id'],
                  label: props.formatLabel
                    ? props.formatLabel(resource.data.data)
                    : resource.data.data[props.label],
                  internal: false,
                  resource: resource.data.data,
                },
              ]
            : [...current];
        });
      }

      filter();
    };

    organiseResults();
  }, [records, defaultValueProperty]);

  useEffect(() => {
    request('');

    if (props.defaultValue && props.withShadowRecord) {
      setSelectedOption({
        record: {
          value: props.defaultValue as string,
          label: props.defaultValue as string,
          internal: true,
        },
        withoutEvents: true,
      });
    }
  }, []);

  useEffect(() => request(''), [props.endpoint]);
  useEffect(() => filter(), [props.exclude]);

  useEffect(() => {
    window.addEventListener('invalidate.combobox.queries', (event: any) => {
      queryClient.invalidateQueries(event.detail.url);

      request('', 0);
    });
  }, []);

  return (
    <div className={`w-full ${props.className}`}>
      {props.inputLabel && (
        <InputLabel className="mb-2">{props.inputLabel}</InputLabel>
      )}
      <Combobox
        disabled={props.disabled}
        value={selectedOption?.record}
        onChange={(record) =>
          setSelectedOption({ record, withoutEvents: false })
        }
      >
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded border border-gray-300 bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 sm:text-sm">
            <Combobox.Input
              placeholder={props.placeholder || ''}
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              onChange={(event) => debouncedSearch(event.target.value)}
              displayValue={(record: Record) => record.label}
              onClick={() => openDropdownButton.current?.click()}
              onFocus={props.onInputFocus}
            />

            {props.clearButton && !props.disabled && !isLoading && (
              <div className="absolute inset-y-0 right-0 mt-2.5 mr-1 cursor-pointer">
                <X
                  className="absolute inset-y-0 right-0 text-gray-400 h-4"
                  onClick={() => props.onClearButtonClick()}
                />
              </div>
            )}

            {!props.clearButton && !isLoading && (
              <div className="absolute inset-y-0 right-0 mt-2.5 mr-1 cursor-pointer">
                <ChevronDown
                  className="absolute inset-y-0 right-0 text-gray-400 h-4"
                  aria-hidden="true"
                  onClick={() => openDropdownButton.current?.click()}
                />
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-y-0 right-0 mt-2 mr-1.5 cursor-pointer">
                <Spinner />
              </div>
            )}

            <Combobox.Button
              className="hidden"
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ref={openDropdownButton}
            >
              <ChevronDown
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
        </div>

        {!isLoading && (
          <Combobox.Options className="absolute z-10 w-80 py-1 mt-2.5 overflow-auto text-base bg-white rounded-md shadow-xl max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {props.onActionClick && props.actionLabel && (
              <button
                className="w-full bg-gray-100 -mt-1 border-b cursor-pointer select-none relative py-2 px-3 text-gray-900"
                type="button"
                onClick={props.onActionClick}
              >
                {props.actionLabel}
              </button>
            )}

            {filteredRecords
              .filter((record) => !record.internal)
              .map((record, index) => (
                <Combobox.Option
                  className="cursor-pointer select-none relative py-2 px-3 text-gray-900 hover:bg-gray-100"
                  key={index}
                  value={record}
                >
                  {record.label}
                </Combobox.Option>
              ))}

            {filteredRecords.filter((record) => !record.internal).length ===
              0 && (
              <div className="select-none relative py-2 px-3 text-gray-700 hover:bg-gray-100">
                {t('no_records_found')}.
              </div>
            )}
          </Combobox.Options>
        )}
      </Combobox>

      {props.errorMessage && (
        <Alert className="mt-2" type="danger">
          {props.errorMessage}
        </Alert>
      )}
    </div>
  );
}
