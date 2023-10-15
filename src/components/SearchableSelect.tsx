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
import { ComboboxStatic, Entry } from './forms/Combobox';
import { v4 } from 'uuid';

interface Props {
  children: ReactNode;
  value: any;
  errorMessage?: string[] | string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
  label?: string | null;
  dismissable?: boolean;
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

  console.log("Dismissable", dismissable)

  return (
    <ComboboxStatic
      entries={entries as Entry[]}
      inputOptions={{ value, label: label ?? undefined }}
      entryOptions={{
        id: 'id',
        label: 'label',
        value: 'value',
      }}
      onChange={(entry) => onValueChange(entry.value.toString())}
      errorMessage={errorMessage}
      readonly={disabled}
      onEmptyValues={() => null}
      onDismiss={dismissable ? () => onValueChange('') : undefined}
    />
  );
}
