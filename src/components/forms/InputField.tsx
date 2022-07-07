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
import { Alert } from 'components/Alert';
import { DebounceInput } from 'react-debounce-input';

import CommonProps from '../../common/interfaces/common-props.interface';
import { InputLabel } from './InputLabel';

interface Props extends CommonProps {
  label?: string;
  id?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  border?: boolean;
  name?: string;
  errorMessage?: string | string[];
  debounceTimeout?: number;
  element?: string;
  disabled?: boolean;
  list?: string;
  min?: string;
  onValueChange?: (value: string) => unknown;
  textareaRows?: number;
  step?: string;
}

export function InputField(props: Props) {
  return (
    <section>
      {props.label && (
        <InputLabel className="mb-2" for={props.id}>
          {props.label}
          {props.required && <span className="ml-1 text-red-600">*</span>}
        </InputLabel>
      )}

      <DebounceInput
        min={props.min}
        disabled={props.disabled}
        element={props.element || 'input'}
        inputRef={props.innerRef}
        debounceTimeout={props.debounceTimeout ?? 300}
        required={props.required}
        id={props.id}
        type={props.type}
        className={classNames(
          `w-full py-2 px-3 rounded text-sm text-gray-900 dark:bg-gray-800 dark:border-transparent dark:text-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed ${props.className}`,
          {
            'border border-gray-300': props.border !== false,
          }
        )}
        placeholder={props.placeholder}
        onChange={(event) => {
          props.onValueChange && props.onValueChange(event.target.value);
          props.onChange && props.onChange(event);
        }}
        value={props.value}
        list={props.list}
        rows={props.textareaRows || 5}
        step={props.step}
      />

      {props.errorMessage && (
        <Alert className="mt-2" type="danger">
          {props.errorMessage}
        </Alert>
      )}
    </section>
  );
}
