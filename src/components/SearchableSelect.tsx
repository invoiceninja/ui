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
  value: string | number | boolean;
  onValueChange: (value: string | number | boolean) => void;
}

const isOptionElement = (child: ReactNode): child is React.ReactElement => {
  return React.isValidElement(child) && child.type === 'option';
};

export function SearchableSelect({ children, value, onValueChange }: Props) {
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
        label: child.props.children,
        value: child.props.value,
        resource: null,
        eventType: 'external',
        searchable: `${child.props.children ?? ''} ${child.props.value ?? ''}`,
      } as Entry<any>)
  );

  return (
    <ComboboxStatic
      entries={entries as Entry[]}
      inputOptions={{ value }}
      entryOptions={{
        id: 'id',
        label: 'label',
        value: 'value',
      }}
      onChange={(entry) => onValueChange(entry.value)}
    />
  );
}
