/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import CommonProps from '../../common/interfaces/common-props.interface';
import { InputField } from '../forms/InputField';
import Select, { MultiValue, SingleValue, StylesConfig } from 'react-select';
import { ReactNode, Dispatch, SetStateAction } from 'react';
import { useColorScheme } from '$app/common/colors';

export interface SelectOption {
  value: string;
  label: string;
  backgroundColor: string;
  color: string;
  queryKey?: string;
}

interface Props extends CommonProps {
  options?: SelectOption[];
  defaultOptions?: SelectOption[];
  optionsPlaceholder?: string;
  optionsMultiSelect?: true | undefined;
  rightSide?: ReactNode;
  onFilterChange?: Dispatch<SetStateAction<string>>;
  onStatusChange?: Dispatch<SetStateAction<string[]>>;
  onCustomFilterChange?: Dispatch<SetStateAction<string[] | undefined>>;
  customFilters?: SelectOption[];
  customFilterPlaceholder?: string;
  beforeFilter?: ReactNode;
  defaultCustomFilterOptions?: SelectOption[];
  filter: string;
  withoutStatusFilter?: boolean;
}

export function Actions(props: Props) {
  const [t] = useTranslation();

  const onStatusChange = (
    options:
      | MultiValue<{ value: string; label: string }>
      | SingleValue<{ value: string; label: string }>
  ) => {
    if (props.onStatusChange) {
      const values: string[] = [];

      (options as SelectOption[]).map(
        (option: { value: string; label: string }) => values.push(option.value)
      );

      return props.onStatusChange(values);
    }
  };

  const onCustomFilterChange = (
    options:
      | MultiValue<{ value: string; label: string }>
      | SingleValue<{ value: string; label: string }>
  ) => {
    if (props.onCustomFilterChange) {
      const values: string[] = [];

      (options as SelectOption[]).map(
        (option: { value: string; label: string }) => values.push(option.value)
      );

      return props.onCustomFilterChange(values);
    }
  };

  const colors = useColorScheme();

  const customStyles: StylesConfig<SelectOption, true> = {
    multiValue: (styles, { data }) => {
      return {
        ...styles,
        backgroundColor: data.backgroundColor,
        color: data.color,
        borderRadius: '3px',
      };
    },
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: data.color,
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    multiValueRemove: (styles) => ({
      ...styles,
      ':hover': {
        color: 'white',
      },
      color: '#999999',
    }),
    menu: (base) => ({
      ...base,
      width: 'max-content',
      minWidth: '100%',
      backgroundColor: colors.$4,
      borderColor: colors.$4,
    }),
    control: (base) => ({
      ...base,
      borderRadius: '3px',
      backgroundColor: colors.$1,
      color: colors.$3,
      borderColor: colors.$5,
    }),
    option: (base) => ({
      ...base,
      backgroundColor: colors.$1,
      ':hover': {
        backgroundColor: colors.$7,
      },
    }),
  };

  return (
    <div
      className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      style={{
        color: colors.$3,
        colorScheme: colors.$0,
        backgroundColor: colors.$2,
        borderColor: colors.$4,
      }}
    >
      <div
        className="flex flex-col space-y-2 mt-2 lg:mt-0 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0"
        style={{
          color: colors.$3,
          colorScheme: colors.$0,
          backgroundColor: colors.$1,
          borderColor: colors.$4,
        }}
      >
        {props.children}
        {props.options &&
          props.defaultOptions &&
          !props.withoutStatusFilter && (
            <Select
              styles={customStyles}
              defaultValue={props.defaultOptions}
              onChange={(options) => onStatusChange(options)}
              placeholder={t('status')}
              options={props.options}
              isMulti={props.optionsMultiSelect}
            />
          )}

        {props.customFilters &&
          props.customFilterPlaceholder &&
          props.defaultCustomFilterOptions && (
            <Select
              styles={customStyles}
              defaultValue={props.defaultCustomFilterOptions}
              onChange={(options) => onCustomFilterChange(options)}
              placeholder={t(props.customFilterPlaceholder)}
              options={props.customFilters}
              isMulti={props.optionsMultiSelect}
            />
          )}
      </div>
      <div className="flex flex-col space-y-2 mt-2 lg:mt-0 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0">
        {props.beforeFilter}

        <InputField
          id="filter"
          changeOverride={true}
          placeholder={t('filter')}
          value={props.filter}
          onValueChange={(value) =>
            props.onFilterChange && props.onFilterChange(value)
          }
          debounceTimeout={800}
        />

        {props.rightSide}
      </div>
    </div>
  );
}
