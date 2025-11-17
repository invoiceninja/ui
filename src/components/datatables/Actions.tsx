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
  ValueContainerProps,
} from 'react-select';
import React, {
  ReactNode,
  Dispatch,
  SetStateAction,
  useRef,
  useState,
} from 'react';
import { useColorScheme } from '$app/common/colors';
import collect from 'collect.js';
import { Button, Checkbox } from '../forms';
import { ChevronDown } from '../icons/ChevronDown';
import classNames from 'classnames';
import { useClickAway } from 'react-use';
import styled from 'styled-components';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { Icon } from '../icons/Icon';
import { MdClose } from 'react-icons/md';

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

export const ResetButton = styled.button`
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  border-color: ${(props) => props.theme.borderColor};
`;

export function MultiValueContainer() {
  return null;
}

export function ValueContainer(props: ValueContainerProps<SelectOption, true>) {
  const colors = useColorScheme();
  const values = props.getValue();
  const label = props.selectProps.placeholder;

  const valueDisplay =
    values.length > 0
      ? values.map((value: SelectOption) => value.label).join(', ')
      : '';

  return (
    <components.ValueContainer {...props}>
      <div className="flex xl:space-x-1 cursor-pointer w-full">
        <span
          className="hidden xl:inline-block font-medium text-sm"
          style={{ color: colors.$17 }}
        >
          {label && `${label}:`}
        </span>

        <span className="truncate text-sm" style={{ maxWidth: '6.5rem' }}>
          {valueDisplay}
        </span>
      </div>
    </components.ValueContainer>
  );
}

export function DropdownIndicator() {
  const colors = useColorScheme();

  return (
    <div
      className={classNames(
        'flex items-center justify-center hover:opacity-75 h-full w-full pr-2 cursor-pointer'
      )}
      style={{ color: colors.$3 }}
    >
      <ChevronDown color={colors.$3} size="1rem" />
    </div>
  );
}

export function Option(props: OptionProps<SelectOption, true>) {
  const { isSelected, label } = props;

  return (
    <components.Option className="rounded-sm" {...props}>
      <div className="flex space-x-3 items-center w-full truncate">
        <Checkbox className="rounded-md" checked={isSelected} />

        <span className="text-sm">{label}</span>
      </div>
    </components.Option>
  );
}

export function Control(props: ControlProps<SelectOption, true>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colors = useColorScheme();
  const label = props.selectProps.placeholder;

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
    <div className="relative">
      {label && (
        <span
          className="xl:hidden absolute left-3 px-1 text-xs font-medium z-10 rounded-sm"
          style={{
            color: colors.$17,
            backgroundColor: colors.$2,
            top: '-0.35rem',
          }}
        >
          {label}
        </span>
      )}

      <components.Control
        className={classNames('shadow-sm', { 'pt-1': label })}
        {...props}
      >
        <div
          ref={containerRef}
          className="flex items-center w-full"
          onClick={handleOpenCloseMenu}
        >
          {props.children}
        </div>
      </components.Control>
    </div>
  );
}

export function SelectWithApplyButton(props: any) {
  const {
    options,
    defaultValue,
    onChange,
    components: customComponents,
    ...restProps
  } = props;

  const [tempValue, setTempValue] = useState(defaultValue);

  const CustomMenu = (menuProps: MenuProps<SelectOption, true>) => {
    const [t] = useTranslation();
    const colors = useColorScheme();
    const reactSettings = useReactSettings();

    const handleReset = () => {
      menuProps.clearValue();
      setTempValue([]);
    };

    const handleApply = () => {
      const selectedValues = menuProps.getValue();
      onChange(selectedValues);
      menuProps.selectProps.onMenuClose();
    };

    return (
      <components.Menu className="px-1" {...menuProps}>
        <div className="flex flex-col space-y-3 pb-3">
          <div>{menuProps.children}</div>

          <div className="flex w-full px-3 space-x-2">
            <ResetButton
              className={classNames('w-1/2 rounded-md text-sm font-medium', {
                border: reactSettings?.dark_mode,
              })}
              onClick={handleReset}
              theme={{
                textColor: colors.$3,
                backgroundColor: '#09090B1A',
              }}
            >
              {t('reset')}
            </ResetButton>

            <Button
              className="w-1/2 rounded-md font-medium"
              onClick={handleApply}
            >
              {t('apply')}
            </Button>
          </div>
        </div>
      </components.Menu>
    );
  };

  const handleChange = (newValue: any) => {
    setTempValue(newValue);
  };

  return (
    <Select
      {...restProps}
      options={options}
      value={tempValue}
      defaultValue={defaultValue}
      onChange={handleChange}
      components={{
        ...customComponents,
        Menu: CustomMenu,
      }}
      className="sm:w-auto w-full"
    />
  );
}

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
      borderColor: colors.$24,
      borderRadius: '0.375rem',
      padding: '0 6px',
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0px 8px',
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
      border: `1px solid ${colors.$19}`,
      zIndex: 10,
      width: '16rem',
      boxShadow: 'none',
    }),
    option: (base) => ({
      ...base,
      color: colors.$3,
      backgroundColor: colors.$1,
      padding: '8px 12px',
      cursor: 'pointer',
      borderRadius: '0.1875rem',
      '&:hover': {
        backgroundColor: colors.$4,
      },
    }),
  };

  const commonComponents = {
    MultiValueContainer,
    ValueContainer,
    DropdownIndicator,
    Option,
    Control,
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

        <div className="relative">
          <InputField
            id="filter"
            className="shadow-sm"
            changeOverride={true}
            placeholder={t('filter')}
            value={props.filter}
            onValueChange={(value) =>
              props.onFilterChange && props.onFilterChange(value)
            }
            debounceTimeout={800}
          />

          {props.filter && (
            <div className="absolute top-[0.65rem] right-[0.4rem] hover:opacity-50 cursor-pointer transition-opacity duration-200">
              <Icon
                element={MdClose}
                size={17}
                style={{ color: colors.$3 }}
                onClick={() => props.onFilterChange?.('')}
              />
            </div>
          )}
        </div>

        {props.options &&
          props.defaultOptions &&
          !props.withoutStatusFilter && (
            <SelectWithApplyButton
              styles={customStyles}
              defaultValue={props.defaultOptions}
              onChange={onStatusChange}
              placeholder={t('lifecycle')}
              options={props.options}
              isMulti={props.optionsMultiSelect}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={commonComponents}
              isClearable={false}
              menuPosition="fixed"
            />
          )}

        {customFilterDropdowns.map(
          (dropDownKey, index) =>
            props.customFilters &&
            props.customFilterPlaceholder &&
            props.defaultCustomFilterOptions && (
              <SelectWithApplyButton
                key={index}
                styles={customStyles}
                defaultValue={props.defaultCustomFilterOptions.filter(
                  (value) => (value.dropdownKey ?? '0') === dropDownKey
                )}
                onChange={(options: any) =>
                  onCustomFilterChange(options, dropDownKey)
                }
                placeholder={t(
                  props.customFilters.filter(
                    (value) => value.dropdownKey === dropDownKey
                  )[0]?.placeHolder ?? props.customFilterPlaceholder
                )}
                components={commonComponents}
                options={props.customFilters.filter(
                  (value) => (value.dropdownKey ?? '0') === dropDownKey
                )}
                isMulti={props.optionsMultiSelect}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                isClearable={false}
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
