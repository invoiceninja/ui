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
import { useColorScheme } from '$app/common/colors';
import CommonProps from '$app/common/interfaces/common-props.interface';
import React, { ReactNode, isValidElement } from 'react';
import Select, { StylesConfig } from 'react-select';
import { SelectOption } from '../datatables/Actions';

interface Props extends CommonProps {
  defaultValue?: any;
  label?: string | null;
  required?: boolean;
  withBlank?: boolean;
  onValueChange?: (value: string) => unknown;
  errorMessage?: string | string[];
  blankOptionValue?: string | number;
}

export function SelectField({
  id,
  value,
  innerRef,
  disabled,
  defaultValue,
  label,
  required,
  onValueChange,
  onChange,
  className,
  style,
  withBlank,
  errorMessage,
  cypressRef,
  blankOptionValue,
  children,
}: Props) {
  const colors = useColorScheme();

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
    <div className="space-y-2">
      {label && (
        <InputLabel className="mb-2" for={id}>
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </InputLabel>
      )}

      <Select
        className={className}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        options={$entries}
        defaultValue={defaultEntry}
        value={selectedEntry}
        onChange={(v) => {
          if (v === null) {
            return onValueChange?.((blankOptionValue as string) ?? '');
          }

          return onValueChange?.(v.value as string);
        }}
        isDisabled={disabled}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        styles={customStyles}
        isSearchable={false}
        isClearable
        data-cy={cypressRef}
      />

      <select
        onChange={(event) => {
          onValueChange && onValueChange(event.target.value);
          onChange && onChange(event);
        }}
        id={id}
        className={classNames(
          `w-full py-2 rounded text-sm border disabled:cursor-not-allowed ${className}`
        )}
        defaultValue={defaultValue}
        value={value}
        ref={innerRef}
        disabled={disabled}
        style={{
          backgroundColor: colors.$1,
          borderColor: colors.$5,
          color: colors.$3,
          ...style,
        }}
        data-cy={cypressRef}
      >
        {withBlank && <option value={blankOptionValue ?? ''}></option>}
        {children}
      </select>

      {errorMessage && (
        <Alert className="mt-2" type="danger">
          {errorMessage}
        </Alert>
      )}
    </div>
  );
}
