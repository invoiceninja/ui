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
import { useMemo, useState } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import CommonProps from '../../common/interfaces/common-props.interface';
import { InputLabel } from './InputLabel';

interface Props extends CommonProps {
  label?: string | null;
  id?: string;
  type?: string;
  placeholder?: string | null;
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
  maxLength?: number;
}

export function InputField(props: Props) {
  const isInitialTypePassword = props.type === 'password';

  const [isInputMasked, setIsInputMasked] = useState(true);

  const inputType = useMemo(() => {
    if (props.type === 'password' && isInputMasked) {
      return 'password';
    }

    if (props.type === 'password' && !isInputMasked) {
      return 'text';
    }

    return props.type;
  }, [props.type, isInputMasked]);

  return (
    <section>
      {props.label && (
        <InputLabel className="mb-2" for={props.id}>
          {props.label}
          {props.required && <span className="ml-1 text-red-600">*</span>}
        </InputLabel>
      )}

      <div className="relative">
        <DebounceInput
          min={props.min}
          maxLength={props.maxLength}
          disabled={props.disabled}
          element={props.element || 'input'}
          inputRef={props.innerRef}
          debounceTimeout={props.debounceTimeout ?? 300}
          required={props.required}
          id={props.id}
          type={inputType}
          className={classNames(
            `w-full py-2 px-3 rounded text-sm text-gray-900 dark:bg-gray-800 dark:border-transparent dark:text-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed ${props.className}`,
            {
              'border border-gray-300': props.border !== false,
            }
          )}
          placeholder={props.placeholder || ''}
          onChange={(event) => {
            props.onValueChange && props.onValueChange(event.target.value);
            props.onChange && props.onChange(event);
          }}
          value={props.value}
          list={props.list}
          rows={props.textareaRows || 5}
          step={props.step}
          data-cy={props.cypressRef}
        />

        {isInitialTypePassword && (
          <span className="absolute top-1/4 right-3 cursor-pointer">
            {isInputMasked ? (
              <AiFillEye
                className="text-gray-400"
                fontSize={19}
                onClick={() => setIsInputMasked(false)}
              />
            ) : (
              <AiFillEyeInvisible
                className="text-gray-400"
                fontSize={19}
                onClick={() => setIsInputMasked(true)}
              />
            )}
          </span>
        )}
      </div>

      {props.errorMessage && (
        <Alert className="mt-2" type="danger">
          {props.errorMessage}
        </Alert>
      )}
    </section>
  );
}
