import { useEffect, useRef, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronDown } from 'react-feather';
import { clone, debounce } from 'lodash';
import axios from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';

export interface Record {
  value: string | number;
  label: string;
  internal: boolean;
  resource?: any;
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
}

const internalRecord = { value: '', label: '', internal: true };

export function DebouncedCombobox(props: Props) {
  const [records, setRecords] = useState<Record[]>([internalRecord]);
  const [selectedOption, setSelectedOption] = useState(records[0]);
  const [defaultValueProperty, setDefaultValueProperty] = useState('');
  const openDropdownButton = useRef<HTMLButtonElement | undefined>();

  useEffect(() => {
    setDefaultValueProperty(props.defaultValue as string);
  }, [props.defaultValue]);

  const request = (query: string) => {
    axios
      .get(endpoint(`${props.endpoint}?filter=${query}`), {
        headers: defaultHeaders,
      })
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

    setSelectedOption(clone(records[0]));
  }, 500);

  useEffect(() => request(''), []);

  useEffect(() => {
    if (!props.disabled) {
      props.onChange(selectedOption);
    }
  }, [selectedOption]);

  useEffect(() => {
    const potential = records.find(
      (record) => record.value == defaultValueProperty
    );

    if (potential) {
      setSelectedOption(potential);
    }
  }, [records, defaultValueProperty]);

  return (
    <div className={`w-full ${props.className}`}>
      <Combobox
        value={selectedOption}
        onChange={setSelectedOption}
        disabled={props.disabled}
      >
        <div className="relative mt-1">
          <div className="relative w-full">
            <Combobox.Input
              placeholder={props.placeholder || ''}
              className="w-full py-2 px-3 rounded text-sm text-gray-900 dark:bg-gray-800 dark:border-transparent dark:text-gray-100 border border-gray-300"
              onChange={(event) => debouncedSearch(event.target.value)}
              displayValue={(record: Record) => record.label}
              onFocus={() => openDropdownButton.current?.click()}
            />
            <Combobox.Button
              className="absolute inset-y-0 right-0 flex items-center pr-2"
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
