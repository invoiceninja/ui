/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { ReactNode, isValidElement } from 'react';
import { Entry } from './forms/Combobox';
import { v4 } from 'uuid';
import Select, { StylesConfig } from 'react-select';
import { InputLabel } from './forms';
import { Alert } from './Alert';
import { useColorScheme } from '$app/common/colors';
import { SelectOption } from './datatables/Actions';

interface Props {
  children: ReactNode;
  value: any;
  errorMessage?: string[] | string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
  label?: string | null;
  dismissable?: boolean;
  clearAfterSelection?: boolean;
}

const isOptionElement = (child: ReactNode): child is React.ReactElement => {
  return React.isValidElement(child) && child.type === 'option';
};

export function SearchableSelect({
  children,
  value,
  errorMessage,
  disabled,
  onValueChange,
  label,
  dismissable,
  clearAfterSelection,
}: Props) {
  const valid = React.Children.toArray(children).every(isOptionElement);

  if (valid === false) {
    throw new Error(
      'SearchableSelect must have only <option> elements as children.'
    );
  }

  const entries = React.Children.map(
    children,
    (child) =>
      isValidElement(child) &&
      ({
        id: v4(),
        label: Array.isArray(child.props.children)
          ? child.props.children.join('')
          : child.props.children,
        value: child.props.value,
        resource: null,
        eventType: 'external',
        searchable: `${child.props.children ?? ''} ${child.props.value ?? ''}`,
      } as Entry<any>)
  );

  const $entries = React.Children.map(
    children,
    (child) =>
      isValidElement(child) && {
        label: Array.isArray(child.props.children)
          ? child.props.children.join('')
          : child.props.children,
        value: child.props.value,
      }
  );

  const selected = !clearAfterSelection
    ? entries?.find((entry) => entry.value === value)
    : '';
  const colors = useColorScheme();

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
      color: colors.$3,
      backgroundColor: isSelected || isFocused ? colors.$7 : colors.$1,
      ':hover': {
        backgroundColor: colors.$7,
      },
    }),
  };

  return (
    <div className="space-y-2">
      {label ? <InputLabel>{label}</InputLabel> : null}

      <Select
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        options={$entries}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        value={selected}
        onChange={(v) => {
          if (v === null) {
            return onValueChange('');
          }

          return onValueChange(v.value as string);
        }}
        isDisabled={disabled}
        isClearable={dismissable}
        styles={customStyles}
      />

      {errorMessage && (
        <Alert className="mt-2" type="danger">
          {errorMessage}
        </Alert>
      )}
    </div>
  );
}
