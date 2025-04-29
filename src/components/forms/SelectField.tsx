/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { Alert } from '$app/components/Alert';
import { InputLabel } from '.';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useColorScheme } from '$app/common/colors';
import React, { CSSProperties, ReactNode, isValidElement } from 'react';
import { SelectOption } from '../datatables/Actions';
import Select, {
  components,
  ControlProps,
  DropdownIndicatorProps,
  StylesConfig,
} from 'react-select';
import { ChevronDown } from '../icons/ChevronDown';
import { merge } from 'lodash';

export interface SelectProps extends CommonProps {
  defaultValue?: any;
  label?: string | null;
  required?: boolean;
  withBlank?: boolean;
  onValueChange?: (value: string) => unknown;
  errorMessage?: string | string[];
  blankOptionValue?: string | number;
  customSelector?: boolean;
  dismissable?: boolean;
  clearAfterSelection?: boolean;
  menuPosition?: 'fixed';
  withoutSeparator?: boolean;
  searchable?: boolean;
  controlIcon?: ReactNode;
  controlStyle?: CSSProperties;
  applyCustomDropdownIndicator?: boolean;
  dropdownIndicatorClassName?: string;
}

export function SelectField(props: SelectProps) {
  const colors = useColorScheme();

  const {
    blankOptionValue,
    withBlank,
    children,
    value,
    defaultValue,
    customSelector,
    onValueChange,
    className,
    disabled,
    cypressRef,
    dismissable = true,
    clearAfterSelection,
    searchable = true,
    controlIcon,
    controlStyle,
    dropdownIndicatorClassName,
  } = props;

  const blankEntry: ReactNode = (
    <option value={blankOptionValue ?? ''}></option>
  );

  const $entries = React.Children.map(
    [withBlank ? blankEntry : [], children],
    (child) =>
      isValidElement(child) && {
        label: Array.isArray(child.props.children)
          ? child.props.children.join('')
          : child.props.children,
        value: child.props.value,
      }
  );

  const selectedEntry = $entries?.find((entry) => entry.value === value) as
    | SelectOption
    | undefined;
  const defaultEntry = $entries?.find(
    (entry) => entry.value === defaultValue
  ) as SelectOption | undefined;

  const customStyles: StylesConfig<SelectOption, false> = {
    input: (styles) => {
      return merge(styles, {
        color: colors.$3,
      });
    },
    singleValue: (styles) => {
      return merge(styles, {
        color: colors.$3,
      });
    },
    menu: (base) => {
      return merge(base, {
        width: 'max-content',
        minWidth: '100%',
        backgroundColor: colors.$4,
        borderColor: colors.$4,
        zIndex: 50,
      });
    },
    control: (base, { isDisabled, isFocused }) => {
      return merge(base, {
        minHeight: '2rem',
        height: '2.3rem',
        paddingLeft: '4px',
        paddingRight: '4px',
        borderRadius: '0.375rem',
        backgroundColor: colors.$1,
        color: colors.$3,
        borderColor: isFocused ? colors.$3 : colors.$24,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        pointerEvents: isDisabled ? 'auto' : 'unset',
        boxShadow: 'none',
        outline: 'none',
        '&:focus': {
          borderColor: colors.$24,
        },
        '&:hover': {
          borderColor: isFocused ? colors.$3 : colors.$24,
        },
        ...controlStyle,
      });
    },
    option: (base, { isSelected, isFocused }) => {
      return merge(base, {
        display: 'flex',
        alignItems: 'center',
        color: colors.$3,
        backgroundColor: isSelected || isFocused ? colors.$7 : colors.$1,
        ':hover': {
          backgroundColor: colors.$7,
        },
        minHeight: '1.875rem',
      });
    },
    valueContainer: (base) => {
      return merge(base, {
        paddingLeft: '0.1rem',
      });
    },

    ...(props.withoutSeparator && {
      indicatorSeparator: () => {
        return {
          display: 'none',
        };
      },
    }),
  };

  const CustomControl = ({
    children,
    ...props
  }: ControlProps<SelectOption, false>) => {
    return (
      <components.Control {...props}>
        <div
          className={classNames('flex space-x-1 items-center w-full', {
            'pl-2': controlIcon,
            'pl-1': !controlIcon,
          })}
          style={{
            height: '95%',
            backgroundColor: colors.$1,
            ...controlStyle,
          }}
        >
          {controlIcon}
          {children}
        </div>
      </components.Control>
    );
  };

  const CustomDropdownIndicator = (
    props: DropdownIndicatorProps<SelectOption, false>
  ) => {
    return (
      <components.DropdownIndicator {...props}>
        <div
          className={classNames(
            'flex items-center justify-center hover:opacity-75',
            dropdownIndicatorClassName
          )}
          style={{ color: colors.$3 }}
        >
          <ChevronDown color={colors.$3} size="0.95rem" />
        </div>
      </components.DropdownIndicator>
    );
  };

  return (
    <div className={classNames({ 'space-y-2': Boolean(customSelector) })}>
      {props.label && (
        <InputLabel className="mb-1" for={props.id}>
          {props.label}
          {props.required && <span className="ml-1 text-red-600">*</span>}
        </InputLabel>
      )}

      {!customSelector ? (
        <select
          onChange={(event) => {
            props.onValueChange && props.onValueChange(event.target.value);
            props.onChange && props.onChange(event);
          }}
          id={props.id}
          className={classNames(
            `w-full py-2 rounded text-sm border disabled:cursor-not-allowed ${props.className}`
          )}
          defaultValue={props.defaultValue}
          value={props.value}
          ref={props.innerRef}
          disabled={props.disabled}
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$5,
            color: colors.$3,
            ...props.style,
          }}
          data-cy={props.cypressRef}
        >
          {props.withBlank && (
            <option value={props.blankOptionValue ?? ''}></option>
          )}
          {props.children}
        </select>
      ) : (
        <Select
          className={className}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          options={$entries}
          defaultValue={defaultEntry}
          value={
            clearAfterSelection
              ? ({ label: '', value: '' } as SelectOption)
              : selectedEntry
          }
          onChange={(v) => {
            if (v === null) {
              return onValueChange?.((blankOptionValue as string) ?? '');
            }

            return onValueChange?.(v.value as string);
          }}
          menuPosition={props.menuPosition}
          isDisabled={disabled}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          styles={customStyles}
          isSearchable={searchable}
          isClearable={Boolean(
            dismissable &&
              selectedEntry?.value &&
              selectedEntry?.value !== blankOptionValue
          )}
          blurInputOnSelect
          data-cy={cypressRef}
          components={{
            Control: CustomControl,
            DropdownIndicator: CustomDropdownIndicator,
          }}
        />
      )}

      {props.errorMessage && (
        <Alert className="mt-2" type="danger">
          {props.errorMessage}
        </Alert>
      )}
    </div>
  );
}
