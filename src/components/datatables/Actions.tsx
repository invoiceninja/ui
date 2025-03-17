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
  ControlProps,
} from 'react-select';
import React, { ReactNode, Dispatch, SetStateAction, useRef } from 'react';
import { useColorScheme } from '$app/common/colors';
import collect from 'collect.js';
import { Button, Checkbox } from '../forms';
import { ChevronDown } from '../icons/ChevronDown';
import classNames from 'classnames';
import { useClickAway } from 'react-use';
import styled from 'styled-components';

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

const ResetButton = styled.button`
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  border-color: ${(props) => props.theme.borderColor};
`;

const MultiValueContainer = () => null;

const ValueContainer = ({ getValue, ...props }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const values = getValue();
  const label = props.selectProps.placeholder;

  let valueDisplay = '';

  if (values.length > 0) {
    valueDisplay = values.map((value: SelectOption) => value.label).join(', ');
  }

  const handleOpenCloseMenu = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (props.selectProps.menuIsOpen) {
      props.selectProps.onMenuClose();
    } else {
      props.selectProps.onMenuOpen();
    }
  };

  useClickAway(containerRef, () => {
    props.selectProps.onMenuClose();
  });

  return (
    <components.ValueContainer {...props}>
      <div
        className="flex"
        ref={containerRef}
        onClick={handleOpenCloseMenu}
        style={{
          cursor: 'pointer',
          width: '100%',
        }}
      >
        {label && <span className="font-medium mr-1">{label}:</span>}

        <span className="truncate" style={{ maxWidth: '6.5rem' }}>
          {valueDisplay}
        </span>
      </div>
    </components.ValueContainer>
  );
};

const DropdownIndicator = (props: any) => {
  const colors = useColorScheme();

  return (
    <components.DropdownIndicator className="cursor-pointer" {...props}>
      <div
        className={classNames(
          'flex items-center justify-center hover:opacity-75 h-full w-full'
        )}
        style={{ color: colors.$3 }}
      >
        <ChevronDown color={colors.$3} size="1rem" />
      </div>
    </components.DropdownIndicator>
  );
};

const Option = (props: OptionProps<SelectOption, true>) => {
  const { isSelected, label } = props;

  return (
    <components.Option {...props}>
      <div className="flex items-center w-full truncate">
        <Checkbox className="h-5 w-5" checked={isSelected} />

        <span>{label}</span>
      </div>
    </components.Option>
  );
};

const Menu = (props: MenuProps<SelectOption, true>) => {
  const [t] = useTranslation();

  const colors = useColorScheme();

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

        <div className="flex w-full px-3 space-x-2">
          <ResetButton
            className="w-1/2 py-2 rounded-md text-sm font-medium border"
            onClick={resetAndClose}
            theme={{
              textColor: colors.$3,
              backgroundColor: '#09090B1A',
              borderColor: colors.$5,
            }}
          >
            {t('reset')}
          </ResetButton>

          <Button
            className="w-1/2 py-2 rounded-md font-medium"
            onClick={applyAndClose}
          >
            {t('apply')}
          </Button>
        </div>
      </div>
    </components.Menu>
  );
};

const Control = (props: ControlProps<SelectOption, true>) => {
  return <components.Control className="shadow-sm" {...props} />;
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
      backgroundColor: colors.$1,
      borderColor: colors.$5,
      borderRadius: '0.5rem',
      padding: '0 6px',
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
      backgroundColor: colors.$1,
      border: `1px solid ${colors.$5}`,
      zIndex: 10,
      padding: '8px',
      boxShadow:
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      width: '16rem',
    }),
    option: (base) => ({
      ...base,
      color: colors.$3,
      backgroundColor: colors.$1,
      padding: '8px 12px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: colors.$4,
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
              placeholder={t('lifecycle')}
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
                Control,
              }}
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
                  Control,
                }}
                options={props.customFilters.filter(
                  (value) => (value.dropdownKey ?? '0') === dropDownKey
                )}
                isMulti={props.optionsMultiSelect}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
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
