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
import CommonProps from 'common/interfaces/common-props.interface';
import { Alert } from 'components/Alert';
import CurrencyInput from 'react-currency-input-field';
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
  min?: string;
  prefix?: string;
  defaultValue?: number;
  decimalLimit?: number;
  decimalSeperator?: string;
  thousandSeperator?: string;
  suffix?: string;
  onValueChange?: (value: string) => unknown;
}

export function CurrencyInputField(props: Props) {
  return (
    <section>
      {props.label && (
        <InputLabel className="mb-2" for={props.id}>
          {props.label}
          {props.required && <span className="ml-1 text-red-600">*</span>}
        </InputLabel>
      )}
      <CurrencyInput
        disabled={props.disabled}
        id={props.id}
        defaultValue={props.defaultValue}
        value={props.value}
        placeholder={props.placeholder}
        onValueChange={(value) => props.onChange(value)}
        decimalsLimit={props.decimalLimit}
        decimalSeparator={props.decimalSeperator}
        groupSeparator={props.thousandSeperator}
        name={props.name}
        prefix={props.prefix}
        suffix={props.suffix}
        className={classNames(
          `w-full py-2 px-3 rounded text-sm text-gray-900 dark:bg-gray-800 dark:border-transparent dark:text-gray-100 ${props.className}`,
          {
            'border border-gray-300': props.border !== false,
          }
        )}
      />

      {props.errorMessage && (
        <Alert className="mt-2" type="danger">
          {props.errorMessage}
        </Alert>
      )}
    </section>
  );
}
