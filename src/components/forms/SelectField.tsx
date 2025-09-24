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
import { InputLabel } from '.';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useColorScheme } from '$app/common/colors';
import React, { CSSProperties, ReactNode, isValidElement } from 'react';
import { SelectOption } from '../datatables/Actions';
import Select, { StylesConfig } from 'react-select';
import { ChevronDown } from '../icons/ChevronDown';
import { merge } from 'lodash';
import { ErrorMessage } from '../ErrorMessage';

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
  searchable?: boolean;
  controlIcon?: ReactNode;
  controlStyle?: CSSProperties;
  applyCustomDropdownIndicator?: boolean;
  dropdownIndicatorClassName?: string;
  placeholder?: string | null;
  readOnly?: boolean;
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
    readOnly,
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

  const selectedEntry = $entries?.find((entry) => entry.value === value);
  const defaultEntry = $entries?.find((entry) => entry.value === defaultValue);

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
        borderRadius: '0.375rem',
        backgroundColor: colors.$1,
        color: colors.$3,
        borderColor: isFocused ? colors.$3 : colors.$24,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        pointerEvents: readOnly ? 'none' : isDisabled ? 'auto' : 'unset',
        boxShadow: 'none',
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
    indicatorSeparator: () => {
      return {
        display: 'none',
      };
    },
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
          className={classNames(className, { 'pointer-events-none': readOnly })}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          options={$entries}
          placeholder={props.placeholder}
          defaultValue={defaultEntry}
          value={clearAfterSelection ? { label: '', value: '' } : selectedEntry}
          onChange={(v) => {
            if (!v) {
              return onValueChange?.((blankOptionValue as string) ?? '');
            }

            return onValueChange?.((v as SelectOption).value as string);
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
            ...((controlIcon || props.menuPosition !== 'fixed') && {
              Control: ({ children: controlChildren, ...rest }) => (
                <div
                  className={classNames(
                    'flex items-center rounded-md border cursor-pointer',
                    {
                      'pl-2': controlIcon,
                      'pl-1': !controlIcon,
                      'pointer-events-none': readOnly,
                    }
                  )}
                  style={{
                    height: '2.5rem',
                    backgroundColor: colors.$1,
                    borderColor: rest.isFocused ? colors.$3 : colors.$24,
                    ...controlStyle,
                  }}
                  {...rest.innerProps}
                >
                  {controlIcon}
                  {controlChildren}
                </div>
              ),
            }),

            DropdownIndicator: () => (
              <div
                className={classNames(
                  'flex items-center justify-center px-3 hover:opacity-75 h-full w-full',
                  dropdownIndicatorClassName
                )}
                style={{ color: colors.$3 }}
              >
                <ChevronDown color={colors.$3} size="1rem" />
              </div>
            ),
          }}
        />
      )}

      <ErrorMessage className="mt-2">{props.errorMessage}</ErrorMessage>
    </div>
  );
}
