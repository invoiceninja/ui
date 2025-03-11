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
import { useMemo, useState } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import CommonProps from '../../common/interfaces/common-props.interface';
import { InputLabel } from './InputLabel';
import { useColorScheme } from '$app/common/colors';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

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
  autoComplete?: string;
  withoutLabelWrapping?: boolean;
  changeOverride?: boolean;
  readOnly?: boolean;
  width?: string | number;
}

export function InputField(props: Props) {
  const colors = useColorScheme();
  const reactSettings = useReactSettings({ overwrite: false });

  const isInitialTypePassword = props.type === 'password';

  const [isInputMasked, setIsInputMasked] = useState<boolean>(true);

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
    <section style={{ width: props.width }}>
      {props.label && (
        <InputLabel
          className={classNames('mb-2', {
            'whitespace-nowrap': props.withoutLabelWrapping,
          })}
          for={props.id}
        >
          {props.label}
          {props.required && <span className="ml-1 text-red-600">*</span>}
        </InputLabel>
      )}

      <div className="relative">
        <DebounceInput
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$5,
            color: colors.$3,
            ...props.style,
          }}
          min={props.min}
          max={props.type === 'date' ? '9999-12-31' : undefined}
          maxLength={props.maxLength}
          autoComplete={props.autoComplete || 'new-password'}
          disabled={props.disabled}
          element={props.element || 'input'}
          inputRef={props.innerRef}
          debounceTimeout={props.debounceTimeout ?? 300}
          required={props.required}
          id={props.id}
          type={inputType}
          className={classNames(
            `w-full py-2 px-3 rounded-md text-sm disabled:opacity-75 disabled:cursor-not-allowed ${props.className}`,
            {
              'border border-gray-300': props.border !== false,
            }
          )}
          placeholder={props.placeholder || ''}
          onBlur={(event) => {
            if (!props.changeOverride) {
              event.target.value =
                event.target.value === '' && props.type === 'number'
                  ? '0'
                  : event.target.value;

              props.onValueChange && props.onValueChange(event.target.value);
              props.onChange && props.onChange(event);
            }
          }}
          onChange={(event) => {
            event.target.value =
              event.target.value === '' && props.type === 'number'
                ? '0'
                : event.target.value;

            if (
              props.element === 'textarea' &&
              reactSettings.preferences.auto_expand_product_table_notes
            ) {
              const scrollHeight = event.target.scrollHeight + 2;

              if (scrollHeight < 200) {
                event.target.style.height = scrollHeight + 'px';
              }
            }

            if (props.changeOverride && props.changeOverride === true) {
              props.onValueChange && props.onValueChange(event.target.value);
              props.onChange && props.onChange(event);
            }
          }}
          onClick={(event: any) => {
            props.onClick && props.onClick();

            if (
              props.element === 'textarea' &&
              reactSettings.preferences.auto_expand_product_table_notes
            ) {
              const scrollHeight = event.target.scrollHeight + 2;

              if (scrollHeight < 200) {
                event.target.style.height = scrollHeight + 'px';
              }

              if (scrollHeight > 200) {
                event.target.style.height = 200 + 'px';
              }
            }
          }}
          onBlurCapture={(event: any) => {
            if (props.element === 'textarea') {
              event.target.style.removeProperty('height');
            }
          }}
          value={props.value}
          list={props.list}
          rows={props.textareaRows || 5}
          step={props.step}
          data-cy={props.cypressRef}
          name={props.name}
          readOnly={props.readOnly}
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
