/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useStaticsQuery } from '$app/common/queries/statics';
import { getExchangeRate } from '$app/pages/payments/common/helpers/resolve-exchange-rate';
import { useTranslation } from 'react-i18next';
import { Element } from './cards';
import { CurrencySelector } from './CurrencySelector';
import { NumberInputField } from './forms/NumberInputField';

interface Props {
  amount: number;
  exchangeRate: string;
  exchangeCurrencyId: string;
  currencyId: string;
  onChange: (exchangeRate: number, exchangeCurrencyId: string) => unknown;
  onExchangeRateChange: (value: number) => unknown;
}

export function ConvertCurrency(props: Props) {
  const { data: statics } = useStaticsQuery();
  const [t] = useTranslation();

  const handleChange = (value: string) => {
    return props.onChange(
      getExchangeRate(props.currencyId, value, statics),
      value
    );
  };

  return (
    <>
      <Element leftSide={t('currency')}>
        <CurrencySelector
          value={props.exchangeCurrencyId}
          onChange={handleChange}
          dismissable
        />
      </Element>

      <Element leftSide={t('exchange_rate')}>
        <NumberInputField
          value={props.exchangeRate || ''}
          onValueChange={(value) =>
            props.onExchangeRateChange(parseFloat(value))
          }
          disablePrecision
        />
      </Element>

      <Element leftSide={t('converted_amount')}>
        <NumberInputField
          value={props.amount * parseFloat(props.exchangeRate) || ''}
          onValueChange={(value) =>
            props.onExchangeRateChange(parseFloat(value) / props.amount)
          }
          disablePrecision
        />
      </Element>
    </>
  );
}
