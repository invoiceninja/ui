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
import Select, {
  components,
  MultiValue,
  SingleValue,
  StylesConfig,
  MenuProps,
  OptionProps,
} from 'react-select';
import React, { ReactNode, Dispatch, SetStateAction } from 'react';
import { useColorScheme } from '$app/common/colors';
import collect from 'collect.js';
import { Button, Checkbox } from '../forms';

export interface SelectOption {
  value: string;
  label: string;
  backgroundColor: string;
  color: string;
  queryKey?: string;
  dropdownKey?: '0' | '1';
  placeHolder?: string;
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
  customFilter: string[] | undefined;
}

// Don't render the default multi-value containers
const MultiValueContainer = () => null;

// Custom ValueContainer to show selected values as a comma-separated list
const ValueContainer = ({ children, getValue, ...props }: any) => {
  const values = getValue();

  // Get the label from data-label attribute or placeholder
  let label = props.selectProps['data-label'] || '';

  if (!label && props.selectProps.placeholder) {
    label = props.selectProps.placeholder;
  }

  let valueDisplay = '';

  if (values.length > 0) {
    valueDisplay = values.map((value: SelectOption) => value.label).join(', ');
  }

  const inputComponent = React.Children.toArray(children).find(
    (child: any) => child?.type?.name === 'Input'
  );

  return (
    <components.ValueContainer {...props}>
      <div className="flex">
        {label && <span className="font-medium mr-1">{label}:</span>}
        <span>{valueDisplay}</span>
      </div>
      {inputComponent}
    </components.ValueContainer>
  );
};

// Custom dropdown indicator (arrow)
const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </components.DropdownIndicator>
  );
};

// Custom Option component with checkbox
const Option = (props: OptionProps<SelectOption, true>) => {
  const { isSelected, label } = props;

  return (
    <components.Option {...props}>
      <div className="flex items-center">
        <Checkbox checked={isSelected} />

        <span>{label}</span>
      </div>
    </components.Option>
  );
};

const Menu = (props: MenuProps<SelectOption, true>) => {
  const [t] = useTranslation();

  const resetAndClose = () => {
    props.clearValue();
  };

  const applyAndClose = () => {
    props.setValue(props.getValue(), 'select-option');
    props.selectProps.onMenuClose();
  };

  return (
    <components.Menu {...props}>
      <div className="flex flex-col space-y-3 pb-3">
        <div>{props.children}</div>

        <div className="flex px-3">
          <Button
            type="secondary"
            onClick={resetAndClose}
            className="flex-1 py-2 mr-1 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            {t('reset')}
          </Button>

          <Button
            onClick={applyAndClose}
            className="flex-1 py-2 ml-1 text-white bg-gray-800 rounded hover:bg-gray-700"
          >
            {t('apply')}
          </Button>
        </div>
      </div>
    </components.Menu>
  );
};

export function Actions(props: Props) {
  const [t] = useTranslation();

  const { customFilter } = props;

  const colors = useColorScheme();

  const customFilterDropdowns = props.customFilters
    ? collect(props.customFilters)
        .pluck('dropdownKey')
        .unique()
        .toArray()
        .map((dropdownKey) => (dropdownKey as string) ?? '0')
    : [];

  const onStatusChange = (
    options: MultiValue<SelectOption> | SingleValue<SelectOption>
  ) => {
    if (props.onStatusChange) {
      const values: string[] = [];

      (options as SelectOption[]).map((option: SelectOption) =>
        values.push(option.value)
      );

      return props.onStatusChange(values);
    }
  };

  const onCustomFilterChange = (
    options: MultiValue<SelectOption> | SingleValue<SelectOption>,
    currentDropdownKey: string
  ) => {
    if (props.onCustomFilterChange && customFilterDropdowns.length === 1) {
      const values: string[] = [];

      (options as SelectOption[]).map((option: SelectOption) =>
        values.push(option.value)
      );

      return props.onCustomFilterChange(values);
    } else if (props.onCustomFilterChange && customFilterDropdowns.length > 1) {
      const values: string[] = [];

      (options as SelectOption[]).map((option: SelectOption) =>
        values.push(option.value)
      );

      if (!customFilter?.length) {
        return props.onCustomFilterChange(values);
      } else {
        const otherDropdownsOptions =
          props.customFilters?.filter(
            (option) =>
              option.dropdownKey !== currentDropdownKey &&
              customFilter.some(
                (currentFilter) => currentFilter === option.value
              )
          ) || [];

        return props.onCustomFilterChange([
          ...otherDropdownsOptions.map((option) => option.value),
          ...values,
        ]);
      }
    }
  };

  const customStyles: StylesConfig<SelectOption, true> = {
    control: (base) => ({
      ...base,
      backgroundColor: 'white',
      borderColor: '#e5e7eb',
      borderRadius: '0.5rem',
      minHeight: '46px',
      boxShadow: 'none',
      padding: '0 6px',
      '&:hover': {
        borderColor: '#d1d5db',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '8px 8px',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6b7280',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#6b7280',
      padding: '0 8px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'white',
      borderColor: colors.$5,
      zIndex: 10,
      padding: '8px',
      boxShadow:
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      minWidth: '240px',
    }),
    option: (base) => ({
      ...base,
      color: colors.$3,
      backgroundColor: colors.$1,
      padding: '8px 12px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: colors.$5,
      },
    }),
  };

  return (
    <div
      className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      style={{
        color: colors.$3,
        colorScheme: colors.$0,
        borderColor: colors.$4,
      }}
    >
      <div
        className="flex flex-col space-y-2 mt-2 lg:mt-0 lg:flex-row lg:items-center lg:space-x-2 lg:space-y-0"
        style={{
          color: colors.$3,
          colorScheme: colors.$0,
          borderColor: colors.$4,
        }}
      >
        {props.children}

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
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={{
                MultiValueContainer,
                ValueContainer,
                DropdownIndicator,
                Option,
                Menu,
              }}
              data-label={t('status')}
              menuPosition="fixed"
            />
          )}

        {customFilterDropdowns.map(
          (dropDownKey, index) =>
            props.customFilters &&
            props.customFilterPlaceholder &&
            props.defaultCustomFilterOptions && (
              <Select
                key={index}
                styles={customStyles}
                defaultValue={props.defaultCustomFilterOptions.filter(
                  (value) => (value.dropdownKey ?? '0') === dropDownKey
                )}
                onChange={(options) =>
                  onCustomFilterChange(options, dropDownKey)
                }
                placeholder={t(
                  props.customFilters.filter(
                    (value) => value.dropdownKey === dropDownKey
                  )[0]?.placeHolder ?? props.customFilterPlaceholder
                )}
                components={{
                  MultiValueContainer,
                  ValueContainer,
                  DropdownIndicator,
                  Option,
                  Menu,
                }}
                options={props.customFilters.filter(
                  (value) => (value.dropdownKey ?? '0') === dropDownKey
                )}
                isMulti={props.optionsMultiSelect}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                data-label={
                  props.customFilters.filter(
                    (value) => value.dropdownKey === dropDownKey
                  )[0]?.placeHolder ?? props.customFilterPlaceholder
                }
                menuPosition="fixed"
              />
            )
        )}
      </div>

      <div className="flex flex-col space-y-2 mt-2 lg:mt-0 lg:flex-row lg:items-center lg:space-x-2 lg:space-y-0">
        {props.beforeFilter}

        {props.rightSide}
      </div>
    </div>
  );
}
