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
import React, { ReactNode, isValidElement } from 'react';
import { SelectOption } from '../datatables/Actions';
import Select, { StylesConfig } from 'react-select';

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
    input: (styles) => ({
      ...styles,
      color: colors.$3,
    }),
    singleValue: (styles) => ({
      ...styles,
      color: colors.$3,
    }),
    menu: (base) => ({
      ...base,
      width: 'max-content',
      minWidth: '100%',
      backgroundColor: colors.$4,
      borderColor: colors.$4,
      zIndex: 50,
    }),
    control: (base, { isDisabled }) => ({
      ...base,
      borderRadius: '3px',
      backgroundColor: colors.$1,
      color: colors.$3,
      borderColor: colors.$5,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      pointerEvents: isDisabled ? 'auto' : 'unset',
    }),
    option: (base, { isSelected, isFocused }) => ({
      ...base,
      display: 'flex',
      alignItems: 'center',
      color: colors.$3,
      backgroundColor: isSelected || isFocused ? colors.$7 : colors.$1,
      ':hover': {
        backgroundColor: colors.$7,
      },
      minHeight: '1.875rem',
    }),
  };

  return (
    <div className={classNames({ 'space-y-2': Boolean(customSelector) })}>
      {props.label && (
        <InputLabel className="mb-2" for={props.id}>
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
          value={clearAfterSelection ? { label: '', value: '' } : selectedEntry}
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
          isSearchable
          isClearable={Boolean(
            dismissable &&
              selectedEntry?.value &&
              selectedEntry?.value !== blankOptionValue
          )}
          data-cy={cypressRef}
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
