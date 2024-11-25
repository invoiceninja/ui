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
import { useEffect, useState } from 'react';

import CommonProps from '../../common/interfaces/common-props.interface';
import { useColorScheme } from '$app/common/colors';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { NumericFormat } from 'react-number-format';
import { useDebounce } from 'react-use';
import { InputLabel } from './InputLabel';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { InputField } from './InputField';

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
  disablePrecision?: boolean;
}

export function NumberInputField(props: Props) {
  const colors = useColorScheme();
  const company = useCurrentCompany();

  const reactSettings = useReactSettings({ overwrite: false });

  const [currentValue, setCurrentValue] = useState<number | undefined>(
    typeof props.value === 'number'
      ? props.value
      : props.value
      ? parseFloat(String(props.value))
      : undefined
  );

  const getDecimalSeparator = () => {
    if (props.precision === 0) {
      return undefined;
    }

    return company?.use_comma_as_decimal_place ? ',' : '.';
  };

  const getNumberPrecision = (enteredValue?: string) => {
    const currentDecimalSeparator = getDecimalSeparator();

    if (currentDecimalSeparator === undefined) {
      return 0;
    }

    if (props.disablePrecision && enteredValue) {
      if (enteredValue.includes(currentDecimalSeparator)) {
        return enteredValue.split(currentDecimalSeparator)?.[1]?.length || 2;
      }

      return undefined;
    }

    if (props.disablePrecision) {
      return undefined;
    }

    if (typeof props.precision === 'number') {
      return props.precision;
    }

    if (
      reactSettings?.number_precision &&
      reactSettings?.number_precision > 0 &&
      reactSettings?.number_precision <= 100
    ) {
      return reactSettings.number_precision;
    }

    return 2;
  };

  const getThousandSeparator = () => {
    if (props.precision === 0) {
      return undefined;
    }

    return company?.use_comma_as_decimal_place ? '.' : ',';
  };

  useDebounce(
    () => {
      if (props.onValueChange && props.changeOverride) {
        props.onValueChange(
          typeof currentValue === 'number' ? String(currentValue) : '0'
        );
      }
    },
    500,
    [currentValue]
  );

  useEffect(() => {
    setCurrentValue(props.value ? parseFloat(String(props.value)) : undefined);
  }, [props.value]);

  if (import.meta.env.VITE_RETURN_NUMBER_FIELD === 'true') {
    return (
      <InputField
        type="number"
        value={props.value}
        errorMessage={props.errorMessage}
        onValueChange={props.onValueChange}
        disabled={props.disabled}
        label={props.label}
        required={props.required}
        withoutLabelWrapping={props.withoutLabelWrapping}
        border={props.border}
        className={props.className}
        style={props.style}
        id={props.id}
        changeOverride={props.changeOverride}
        placeholder={props.placeholder}
        cypressRef={props.cypressRef}
        innerRef={props.innerRef}
      />
    );
  }

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
          value={currentValue || ''}
          placeholder={props.placeholder ?? undefined}
          onChange={(event) => {
            if (props.onValueChange && props.changeOverride) {
              const enteredValue = event.target.value;

              const formattedValue = enteredValue
                ? currency(enteredValue, {
                    separator: getThousandSeparator(),
                    decimal: getDecimalSeparator(),
                    symbol: '',
                    precision:
                      getNumberPrecision(enteredValue) === undefined
                        ? 0
                        : getNumberPrecision(enteredValue),
                  }).value
                : undefined;

              setCurrentValue(formattedValue);
            }
          }}
          onBlur={(event) => {
            if (props.onValueChange && !props.changeOverride) {
              const enteredValue = event.target.value;

              const formattedValue = enteredValue
                ? String(
                    currency(enteredValue, {
                      separator: getThousandSeparator(),
                      decimal: getDecimalSeparator(),
                      symbol: '',
                      precision:
                        getNumberPrecision(enteredValue) === undefined
                          ? 0
                          : getNumberPrecision(enteredValue),
                    }).value
                  )
                : '0';

              props.onValueChange(formattedValue);
            }
          }}
          thousandSeparator={getThousandSeparator()}
          decimalSeparator={getDecimalSeparator()}
          decimalScale={getNumberPrecision()}
          allowNegative
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$5,
            color: colors.$3,
            ...props.style,
          }}
          disabled={props.disabled}
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
