/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import classNames from 'classnames';
import { Currency } from 'common/interfaces/currency';
import { Alert } from 'components/Alert';
import currency from 'currency.js';
import { useState } from 'react';
import { DebounceInput } from 'react-debounce-input';

import CommonProps from '../../common/interfaces/common-props.interface';
import { InputLabel } from './InputLabel';

interface Props extends CommonProps {
  label?: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
  border?: boolean;
  name?: string;
  errorMessage?: string | string[];
  debounceTimeout?: number;
  element?: string;
  disabled?: boolean;
  list?: string;
  currency?: Currency;
  decimalSeparator?: string;
  groupSeparator?: string;
  precision?: string;
  code?: string;
  symbol?: string;

  onValueChange?: (value: string) => unknown;
}

export function CurrencyInput(props: Props) {
  const [value, setValue] = useState<number>();

  return (
    <section>
      {props.label && (
        <InputLabel className="mb-2" for={props.id}>
          {props.label}
          {props.required && <span className="ml-1 text-red-600">*</span>}
        </InputLabel>
      )}

      <DebounceInput
        disabled={props.disabled}
        element={props.element || 'input'}
        inputRef={props.innerRef}
        debounceTimeout={props.debounceTimeout ?? 300}
        required={props.required}
        id={props.id}
        type={'text'}
        className={classNames(
          `w-full py-2 px-3 rounded text-sm text-gray-900 dark:bg-gray-800 dark:border-transparent dark:text-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed ${props.className}`,
          {
            'border border-gray-300': props.border !== false,
          }
        )}
        placeholder={props.placeholder}
        onChange={(event) => {
          console.log(currency(event.target.value));
          setValue(currency(event.target.value).value);
        }}
        value={props.value}
        list={props.list}
      />
      {console.log('value:', value)}
      {props.errorMessage && (
        <Alert className="mt-2" type="danger">
          {props.errorMessage}
        </Alert>
      )}
    </section>
  );
}
