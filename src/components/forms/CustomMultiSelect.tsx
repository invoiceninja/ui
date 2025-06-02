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
import { useRef, useState } from 'react';
import Select, {
  ClearIndicatorProps,
  components,
  ControlProps,
  OptionProps,
  StylesConfig,
  ValueContainerProps,
} from 'react-select';
import { useColorScheme } from '$app/common/colors';
import classNames from 'classnames';
import { Checkbox } from '$app/components/forms';
import { ChevronDown } from '$app/components/icons/ChevronDown';
import { useClickAway } from 'react-use';
import { t } from 'i18next';
import { XMark } from '../icons/XMark';
import styled from 'styled-components';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

function MultiValueContainer() {
  return null;
}

function ClearIndicator(props: ClearIndicatorProps) {
  const colors = useColorScheme();

  return (
    <components.ClearIndicator
      {...props}
      className="opacity-70 hover:opacity-100 transition-opacity duration-150 cursor-pointer"
    >
      <div className="pr-5 pl-1.5">
        <XMark size="0.9rem" color={colors.$3} />
      </div>
    </components.ClearIndicator>
  );
}

function ValueContainer(props: ValueContainerProps<SelectOption, true>) {
  const colors = useColorScheme();
  const values = props.getValue();
  const currentSelectedProps = props.selectProps;

  const label = currentSelectedProps.placeholder;

  const valueDisplay =
    values.length > 0
      ? values.map((value: SelectOption) => value.label).join(', ')
      : '';

  const menuIsOpen = currentSelectedProps.menuIsOpen;
  const isSearchable = currentSelectedProps.isSearchable;
  const withoutLabel =
    currentSelectedProps['withoutLabel' as keyof typeof currentSelectedProps];

  const searchTerm = currentSelectedProps.inputValue || '';
  const onSearchTermChange = currentSelectedProps[
    'onSearchTermChange' as keyof typeof currentSelectedProps
  ] as ((value: string) => void) | undefined;

  return (
    <components.ValueContainer {...props}>
      <div className="flex xl:space-x-1 cursor-pointer w-full">
        {label && (
          <span
            className="hidden xl:inline-block font-medium text-sm"
            style={{ color: colors.$17 }}
          >
            {withoutLabel ? `${t('select')}:` : `${label}:`}
          </span>
        )}

        {menuIsOpen && isSearchable ? (
          <div className="flex-1 flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                onSearchTermChange && onSearchTermChange(e.target.value)
              }
              placeholder={t('search') as string}
              className="w-full text-sm border-0 focus:outline-none focus:ring-0 p-0"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (
                  ['Escape', 'Tab', 'Enter', 'ArrowUp', 'ArrowDown'].includes(
                    e.key
                  )
                ) {
                  e.stopPropagation();
                }
              }}
              autoFocus
              style={{ backgroundColor: 'transparent' }}
            />
          </div>
        ) : (
          <div className="truncate text-sm flex-1">{valueDisplay}</div>
        )}
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

function Control(props: ControlProps<SelectOption, true>) {
  const colors = useColorScheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSelectedProps = props.selectProps;

  const label = currentSelectedProps.placeholder;
  const withoutLabel =
    currentSelectedProps['withoutLabel' as keyof typeof currentSelectedProps];

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
          className="xl:hidden absolute left-3 px-1 text-xs font-medium z-10 rounded-sm truncate"
          style={{
            color: colors.$17,
            backgroundColor: colors.$1,
            top: '-0.475rem',
            maxWidth: '50%',
          }}
        >
          {withoutLabel ? `${t('select')}` : `${label}`}
        </span>
      )}

      <components.Control
        className={classNames('shadow-sm', { 'pt-1': label })}
        {...props}
      >
        <div
          ref={containerRef}
          className="flex items-center w-full h-[2.2rem] cursor-pointer"
          onClick={handleOpenCloseMenu}
        >
          {props.children}
        </div>
      </components.Control>
    </div>
  );
}

function Option(props: OptionProps<SelectOption, true>) {
  const { isSelected, label, data, innerProps } = props;
  const colors = useColorScheme();

  return (
    <Box
      {...innerProps}
      className="flex space-x-3 items-center w-full truncate px-[0.75rem] py-2 cursor-pointer rounded-[0.1875rem]"
      theme={{
        backgroundColor: colors.$1,
        hoverBackgroundColor: colors.$4,
      }}
    >
      <Checkbox className="rounded-md" checked={isSelected} />
      <span className="text-sm">{label}</span>
    </Box>
  );
}

function Menu(props: any) {
  return (
    <components.Menu className="p-1" {...props}>
      {props.children}
    </components.Menu>
  );
}

function NoOptionsMessage(props: any) {
  const colors = useColorScheme();

  return (
    <components.NoOptionsMessage {...props}>
      <div className="p-3 text-sm text-center" style={{ color: colors.$3 }}>
        {t('no_records_found')}.
      </div>
    </components.NoOptionsMessage>
  );
}

function CustomSelect(props: any) {
  const {
    options,
    defaultValue,
    onChange,
    components: customComponents,
    isSearchable,
    ...restProps
  } = props;

  const [inputValue, setInputValue] = useState('');

  const clearValues = () => {
    onChange([]);
  };

  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  const onMenuClose = () => {
    setInputValue('');

    if (restProps.onMenuClose) {
      restProps.onMenuClose();
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const filterOption = (option: any, inputValue: string) => {
    if (!inputValue || !isSearchable) return true;
    return option.label.toLowerCase().includes(inputValue.toLowerCase());
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
      }}
      className="sm:w-auto w-full"
      onMenuClose={onMenuClose}
      inputValue={inputValue}
      onSearchTermChange={handleInputChange}
      isSearchable={isSearchable}
      clearValues={clearValues}
      withoutLabel={Boolean(!restProps.placeholder)}
      filterOption={filterOption}
    />
  );
}

interface Props {
  id?: string;
  defaultValue?: SelectOption[];
  value?: SelectOption[];
  options: SelectOption[];
  onValueChange: (value: any) => void;
  placeholder?: string | null;
  onInputChange?: (inputValue: string) => void;
  isSearchable?: boolean;
}

export function CustomMultiSelect(props: Props) {
  const colors = useColorScheme();
  const {
    id,
    defaultValue,
    options,
    onValueChange,
    placeholder,
    onInputChange,
    isSearchable = false,
    value,
  } = props;

  const commonComponents = {
    MultiValueContainer,
    ValueContainer,
    DropdownIndicator,
    Control,
    ClearIndicator,
    Option,
    Menu,
    NoOptionsMessage,
    Input: () => null,
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
      padding: '0.25rem',
    }),
    option: (base) => ({
      ...base,
      backgroundColor: 'transparent',
      cursor: 'pointer',
      padding: '0',
      margin: '0',
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '&:active': {
        backgroundColor: 'transparent',
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '0px',
      cursor: 'pointer',
    }),
  };

  return (
    <CustomSelect
      id={id}
      value={value}
      defaultValue={defaultValue}
      onChange={(options: any) => onValueChange(options)}
      components={commonComponents}
      placeholder={placeholder}
      options={options}
      isMulti={true}
      styles={customStyles}
      onInputChange={onInputChange}
      hideSelectedOptions={false}
      isSearchable={isSearchable}
    />
  );
}
