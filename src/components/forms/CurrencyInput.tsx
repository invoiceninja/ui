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
import { DebounceInput } from 'react-debounce-input';

import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  id?: string;
  border?: boolean;
  errorMessage?: string | string[];
  currency?: Currency;

  onValueChange?: (value: string) => unknown;
}

export function CurrencyInput(props: Props) {
  return (
    <section>
      {props.currency && (
        <DebounceInput
          element={'input'}
          debounceTimeout={300}
          id={props.id}
          type={'text'}
          className={classNames(
            `w-full py-2 px-3 rounded text-sm text-gray-900 dark:bg-gray-800 dark:border-transparent dark:text-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed ${props.className}`,
            {
              'border border-gray-300': props.border !== false,
            }
          )}
          onChange={(event) => {
            props.onChange &&
              props.onChange(
                String(
                  currency(event.target.value, {
                    separator: props.currency?.thousand_separator,
                    decimal: props.currency?.decimal_separator,
                    symbol: '',
                    precision: props.currency?.precision,
                  }).value
                )
              );
          }}
          value={currency(props.value, {
            separator: props.currency?.thousand_separator,
            decimal: props.currency?.decimal_separator,
            symbol: '',
            precision: props.currency?.precision,
          }).format()}
        />
      )}
      {props.errorMessage && (
        <Alert className="mt-2" type="danger">
          {props.errorMessage}
        </Alert>
      )}
    </section>
  );
}
