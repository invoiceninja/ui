import { useEffect, useRef, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronDown, X } from 'react-feather';
import { clone, debounce } from 'lodash';
import axios from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { useQueryClient } from 'react-query';
import { InputLabel } from './InputLabel';

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
}

const internalRecord = { value: '', label: '', internal: true };

export function DebouncedCombobox(props: Props) {
  const [records, setRecords] = useState<Record[]>([internalRecord]);

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

  const request = (query: string) => {
    const url = new URL(endpoint(props.endpoint));

    url.searchParams.set('filter', query);

    queryClient
      .fetchQuery(
        url.href,
        () =>
          axios.get(url.href, {
            headers: defaultHeaders(),
          }),
        { staleTime: Infinity }
      )
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
  }, 500);

  useEffect(() => request(''), []);

  useEffect(() => {
    if (!props.disabled && selectedOption.withoutEvents === false) {
      props.onChange(selectedOption.record);
    }
  }, [selectedOption]);

  useEffect(() => {
    const potential = records.find(
      (record) =>
        record.value == defaultValueProperty ||
        record.label == defaultValueProperty
    );

    if (potential) {
      setSelectedOption({ record: potential, withoutEvents: true });
    }
  }, [records, defaultValueProperty]);

  useEffect(() => {
    request('');
  }, [props.endpoint]);

  return (
    <div className={`w-full ${props.className}`}>
      {props.inputLabel && (
        <InputLabel className="mb-2">{props.inputLabel}</InputLabel>
      )}
      <Combobox
        value={selectedOption?.record}
        onChange={(record) =>
          setSelectedOption({ record, withoutEvents: false })
        }
        disabled={props.disabled}
      >
        <div className="relative mt-1">
          <div className="relative w-full">
            <Combobox.Input
              placeholder={props.placeholder || ''}
              className="w-full py-2 px-3 rounded text-sm text-gray-900 dark:bg-gray-800 dark:border-transparent dark:text-gray-100 border border-gray-300"
              onChange={(event) => debouncedSearch(event.target.value)}
              displayValue={(record: Record) => record.label}
              onClick={() => openDropdownButton.current?.click()}
            />
            {props.clearButton && !props.disabled && (
              <X
                className="absolute inset-y-0 mt-2 right-0 flex items-center pr-2 w-8 h-5 text-gray-400 hover:cursor-pointer"
                onClick={() => props.onClearButtonClick()}
              />
            )}

            {!props.clearButton && (
              <ChevronDown
                className="absolute inset-y-0 mt-2 right-0 flex items-center pr-2 w-8 h-5 text-gray-400"
                aria-hidden="true"
                onClick={() => openDropdownButton.current?.click()}
              />
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

          {records
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
        </Combobox.Options>
      </Combobox>
    </div>
  );
}
