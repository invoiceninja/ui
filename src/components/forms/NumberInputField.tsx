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
import currency from 'currency.js';
import { useState } from 'react';

import CommonProps from '../../common/interfaces/common-props.interface';
import { useColorScheme } from '$app/common/colors';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { NumericFormat } from 'react-number-format';
import { useDebounce } from 'react-use';
import { InputLabel } from './InputLabel';

interface Props extends CommonProps {
  id?: string;
  border?: boolean;
  precision?: number;
  errorMessage?: string | string[];
  initialValue?: string;
  onValueChange?: (value: string) => unknown;
  changeOverride?: boolean;
  label?: string | null;
  required?: boolean;
  withoutLabelWrapping?: boolean;
  placeholder?: string | null;
}

export function NumberInputField(props: Props) {
  const colors = useColorScheme();
  const company = useCurrentCompany();

  const [currentValue, setCurrentValue] = useState<number>(
    parseFloat(props.initialValue || '0')
  );

  useDebounce(
    () => {
      if (props.onValueChange) {
        props.onValueChange(String(currentValue));
      }
    },
    500,
    [currentValue]
  );

  return (
    <section>
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
        <NumericFormat
          className={classNames(
            `w-full py-2 px-3 rounded text-sm disabled:opacity-75 disabled:cursor-not-allowed ${props.className}`,
            {
              'border border-gray-300': props.border !== false,
            }
          )}
          value={props.initialValue}
          placeholder={props.placeholder ?? undefined}
          onChange={(event) => {
            if (props.onValueChange && props.changeOverride) {
              const formattedValue = currency(event.target.value, {
                separator: company?.use_comma_as_decimal_place ? '.' : ',',
                decimal: company?.use_comma_as_decimal_place ? ',' : '.',
                symbol: '',
                precision: props.precision || 2,
              }).value;

              setCurrentValue(formattedValue);
            }
          }}
          onBlur={(event) => {
            if (props.onValueChange && !props.changeOverride) {
              props.onValueChange(
                String(
                  currency(event.target.value, {
                    separator: company?.use_comma_as_decimal_place ? '.' : ',',
                    decimal: company?.use_comma_as_decimal_place ? ',' : '.',
                    symbol: '',
                    precision: props.precision || 2,
                  }).value
                )
              );
            }
          }}
          thousandSeparator={company?.use_comma_as_decimal_place ? '.' : ','}
          decimalSeparator={company?.use_comma_as_decimal_place ? ',' : '.'}
          decimalScale={props.precision || 2}
          allowNegative
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$5,
            color: colors.$3,
            ...props.style,
          }}
        />
      </div>

      {props.errorMessage && (
        <Alert className="mt-2" type="danger">
          {props.errorMessage}
        </Alert>
      )}
    </section>
  );
}
