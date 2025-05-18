/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectOption } from '$app/components/datatables/Actions';
import { useRef } from 'react';
import Select, {
  components,
  ControlProps,
  MenuProps,
  MultiValue,
  OptionProps,
  StylesConfig,
  ValueContainerProps,
} from 'react-select';
import { useColorScheme } from '$app/common/colors';
import classNames from 'classnames';
import { Checkbox } from '$app/components/forms';
import { ChevronDown } from '$app/components/icons/ChevronDown';
import { useClickAway } from 'react-use';

function MultiValueContainer() {
  return null;
}

function ValueContainer(props: ValueContainerProps<SelectOption, true>) {
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

        <div className="truncate text-sm flex-1">{valueDisplay}</div>
      </div>
    </components.ValueContainer>
  );
}

function DropdownIndicator() {
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

function Option(props: OptionProps<SelectOption, true>) {
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

function Control(props: ControlProps<SelectOption, true>) {
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

function CustomSelect(props: any) {
  const {
    options,
    defaultValue,
    onChange,
    components: customComponents,
    ...restProps
  } = props;

  const CustomMenu = (menuProps: MenuProps<SelectOption, true>) => {
    return (
      <components.Menu className="px-1" {...menuProps}>
        <div>{menuProps.children}</div>
      </components.Menu>
    );
  };

  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  return (
    <Select
      {...restProps}
      options={options}
      value={restProps.value}
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

interface Props {
  id?: string;
  value?: SelectOption[];
  options: SelectOption[];
  onValueChange: (value: MultiValue<SelectOption>) => void;
  placeholder?: string | null;
}

export function CustomMultiSelect(props: Props) {
  const colors = useColorScheme();

  const { id, value, options, onValueChange, placeholder } = props;

  const commonComponents = {
    MultiValueContainer,
    ValueContainer,
    DropdownIndicator,
    Option,
    Control,
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

  return (
    <CustomSelect
      id={id}
      value={value}
      onChange={(options: MultiValue<SelectOption>) => onValueChange(options)}
      components={commonComponents}
      placeholder={placeholder}
      options={options}
      isMulti={true}
      styles={customStyles}
    />
  );
}
